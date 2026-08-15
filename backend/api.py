from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from datetime import timedelta, datetime, time
from typing import List, Optional
import models, schemas, database, config, scheduler, auth

router = APIRouter(prefix="/api")

@router.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id), "role": user.role.value}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}

@router.post("/bookings", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    booking.start_date = booking.start_date.replace(tzinfo=None)
    booking.end_date = booking.end_date.replace(tzinfo=None)

    if booking.start_date >= booking.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
        
    equipment = db.query(models.Equipment).filter(models.Equipment.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    maintenances = db.query(models.MaintenanceLog).filter(
        models.MaintenanceLog.equipment_id == booking.equipment_id,
        models.MaintenanceLog.end_date > booking.start_date,
        models.MaintenanceLog.start_date < booking.end_date
    ).all()

    # Shift-aware maintenance check: allow non-overlapping shifts on same day.
    def shift_range_from(shift: str, start_dt: datetime, end_dt: datetime):
        d = start_dt.date()
        if shift == 'morning':
            return datetime.combine(d, time(8, 0)), datetime.combine(d, time(12, 0))
        if shift == 'afternoon':
            return datetime.combine(d, time(13, 0)), datetime.combine(d, time(17, 0))
        # full_day -> treat as occupying both shifts contiguous on single day
        return datetime.combine(d, time(8, 0)), datetime.combine(d, time(17, 0))

    for m in maintenances:
        # If maintenance spans multiple days or booking spans multiple days, keep day-level blocking
        if (m.start_date.date() != m.end_date.date()) or (booking.start_date.date() != booking.end_date.date()):
            raise HTTPException(status_code=409, detail="Conflicts with scheduled maintenance")

        # Both maintenance and booking are single-day ranges
        b_shift = getattr(booking, 'shift', 'full_day')
        b_s, b_e = shift_range_from(b_shift, booking.start_date, booking.end_date)

        m_s, m_e = m.start_date, m.end_date

        # Overlap check
        if not (b_e <= m_s or m_e <= b_s):
            raise HTTPException(status_code=409, detail="Conflicts with scheduled maintenance")
        
    existing_bookings_qs = db.query(models.Booking).filter(
        models.Booking.equipment_id == booking.equipment_id,
        models.Booking.status == models.BookingStatus.approved
    ).all()
    
    existing_list = [{
        'id': b.id, 'start_date': b.start_date, 'end_date': b.end_date,
        'site_id': b.site_id, 'priority': b.priority, 'status': b.status.value,
        'shift': getattr(b, 'shift', 'full_day')
    } for b in existing_bookings_qs]
        
    new_request = {
        'id': 'new', 'start_date': booking.start_date, 'end_date': booking.end_date,
        'site_id': booking.site_id, 'priority': booking.priority, 'shift': getattr(booking, 'shift', 'full_day')
    }
    
    is_accepted, displaced_ids, message = scheduler.resolve_booking_conflicts(
        equipment_id=booking.equipment_id,
        existing_bookings=existing_list,
        new_booking=new_request,
        transport_buffer_hours=config.TRANSPORT_BUFFER_HOURS
    )
    
    if not is_accepted:
        raise HTTPException(status_code=409, detail=message)
        
    if displaced_ids:
        note = f"Auto-displaced by higher priority request to site_id {booking.site_id}"
        db.query(models.Booking).filter(models.Booking.id.in_(displaced_ids)).update(
            {"status": models.BookingStatus.displaced, "resolution_note": note}, synchronize_session=False
        )
        
    db_booking = models.Booking(
        equipment_id=booking.equipment_id,
        site_id=booking.site_id,
        user_id=current_user.id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        priority=booking.priority,
        status=models.BookingStatus.approved,
        shift=getattr(booking, 'shift', 'full_day')
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    return db_booking

@router.get("/bookings", response_model=List[schemas.BookingResponse])
def get_bookings(
    site_id: Optional[int] = Query(None),
    equipment_id: Optional[int] = Query(None),
    status: Optional[models.BookingStatus] = Query(None),
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Booking)
    if site_id: query = query.filter(models.Booking.site_id == site_id)
    if equipment_id: query = query.filter(models.Booking.equipment_id == equipment_id)
    if status: query = query.filter(models.Booking.status == status)
    return query.offset(offset).limit(limit).all()

@router.get("/equipment", response_model=List[schemas.EquipmentResponse])
def get_equipment(limit: int = 100, offset: int = 0, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Equipment).offset(offset).limit(limit).all()

@router.get("/equipment/{id}", response_model=schemas.EquipmentDetailResponse)
def get_equipment_detail(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    equip = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if not equip: raise HTTPException(status_code=404, detail="Equipment not found")
    return equip

@router.get("/sites", response_model=List[schemas.SiteResponse])
def get_sites(limit: int = 100, offset: int = 0, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Site).offset(offset).limit(limit).all()

@router.get("/maintenance", response_model=List[schemas.MaintenanceResponse])
def get_maintenance(equipment_id: Optional[int] = Query(None), limit: int = 100, offset: int = 0, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.MaintenanceLog)
    if equipment_id: query = query.filter(models.MaintenanceLog.equipment_id == equipment_id)
    return query.offset(offset).limit(limit).all()

@router.post("/maintenance", response_model=schemas.MaintenanceResponse)
def create_maintenance(
    maint: schemas.MaintenanceCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    maint.start_date = maint.start_date.replace(tzinfo=None)
    maint.end_date = maint.end_date.replace(tzinfo=None)
    db_maint = models.MaintenanceLog(**maint.dict())
    db.add(db_maint)
    db.commit()
    db.refresh(db_maint)
    return db_maint

@router.get("/conflicts", response_model=List[schemas.BookingResponse])
def get_conflicts(limit: int = 100, offset: int = 0, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Booking).filter(models.Booking.status == models.BookingStatus.displaced).order_by(models.Booking.id.desc()).offset(offset).limit(limit).all()

@router.patch("/bookings/{id}/override", response_model=schemas.BookingResponse)
def override_booking(
    id: int,
    req: schemas.OverrideRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_role("manager"))
):
    booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = req.status
    booking.resolution_note = req.resolution_note
    db.commit()
    db.refresh(booking)
    return booking
