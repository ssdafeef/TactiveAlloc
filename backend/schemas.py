from pydantic import BaseModel
from pydantic import Field
from datetime import datetime
from typing import Optional, List
from models import UserRole, EquipmentStatus, BookingStatus

# Users
class UserBase(BaseModel):
    username: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        orm_mode = True

# Sites
class SiteBase(BaseModel):
    name: str
    location: str

class SiteCreate(SiteBase):
    pass

class SiteResponse(SiteBase):
    id: int
    class Config:
        orm_mode = True

# Equipment
class EquipmentBase(BaseModel):
    name: str
    type: str
    status: EquipmentStatus = EquipmentStatus.available

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentResponse(EquipmentBase):
    id: int
    class Config:
        orm_mode = True

# Bookings
class BookingBase(BaseModel):
    equipment_id: int
    site_id: int
    start_date: datetime
    end_date: datetime
    priority: int = Field(default=2, ge=1, le=3)
    shift: str = Field(default="full_day")

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: BookingStatus
    resolution_note: Optional[str] = None
    class Config:
        orm_mode = True

class OverrideRequest(BaseModel):
    status: BookingStatus
    resolution_note: str

class EquipmentDetailResponse(EquipmentResponse):
    bookings: List[BookingResponse] = []

# Maintenance
class MaintenanceBase(BaseModel):
    equipment_id: int
    start_date: datetime
    end_date: datetime
    description: str

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceResponse(MaintenanceBase):
    id: int
    class Config:
        orm_mode = True
