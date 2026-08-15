import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from main import app
from database import Base, get_db
import models
import auth

# Create in-memory sqlite db for tests to ensure full isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # Setup tables
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed data required for tests
    db.add(models.User(id=1, username="manager1", hashed_password=auth.get_password_hash("pass"), role=models.UserRole.manager))
    db.add(models.User(id=2, username="eng1", hashed_password=auth.get_password_hash("pass"), role=models.UserRole.site_engineer))
    db.add(models.Site(id=1, name="Site A", location="North"))
    db.add(models.Site(id=2, name="Site B", location="South"))
    db.add(models.Equipment(id=1, name="EX-001", type="Excavator"))
    db.commit()
    db.close()
    
    yield
    # Teardown
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def manager_token():
    res = client.post("/api/auth/login", data={"username": "manager1", "password": "pass"})
    return res.json()["access_token"]

@pytest.fixture
def engineer_token():
    res = client.post("/api/auth/login", data={"username": "eng1", "password": "pass"})
    return res.json()["access_token"]

def test_auth_unauthenticated():
    res = client.get("/api/bookings")
    assert res.status_code == 401

def test_auth_forbidden_role(engineer_token):
    res = client.post("/api/maintenance", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-02T10:00:00Z", "reason": "Fix"
    })
    assert res.status_code == 403

def test_successful_booking(engineer_token):
    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 3,
        "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-05T10:00:00Z"
    })
    assert res.status_code == 200
    assert res.json()["status"] == "approved"

def test_priority_displacement(engineer_token):
    # Low priority booking (P3)
    client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 3,
        "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-05T10:00:00Z"
    })
    # High priority booking (P1) overlapping exactly
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-01-02T10:00:00Z", "end_date": "2025-01-03T10:00:00Z"
    })
    assert res2.status_code == 200
    
    # Verify P3 was displaced
    disp = client.get("/api/conflicts", headers={"Authorization": f"Bearer {engineer_token}"})
    assert len(disp.json()) == 1
    assert disp.json()[0]["priority"] == 3

def test_same_priority_overlap(engineer_token):
    # Standard priority booking (P2)
    client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-05T10:00:00Z"
    })
    # Another P2 booking overlapping
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-02T10:00:00Z", "end_date": "2025-01-03T10:00:00Z"
    })
    # Should throw a 409 Conflict because neither can displace the other
    assert res2.status_code == 409

def test_booking_during_maintenance(manager_token, engineer_token):
    # Schedule maintenance
    res_maint = client.post("/api/maintenance", headers={"Authorization": f"Bearer {manager_token}"}, json={
        "equipment_id": 1, "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-02T10:00:00Z", "description": "Routine"
    })
    assert res_maint.status_code == 200
    # Attempt booking during maintenance
    res = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-01-01T15:00:00Z", "end_date": "2025-01-05T10:00:00Z"
    })
    # Should throw a 409 Conflict because maintenance is mandatory
    assert res.status_code == 409

def test_transport_buffer_violation(engineer_token):
    # Book at Site 1
    client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-01T14:00:00Z"
    })
    # Try to book at Site 2 just 2 hours later (needs 4 hour buffer)
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 2, "priority": 1,
        "start_date": "2025-01-01T16:00:00Z", "end_date": "2025-01-02T10:00:00Z"
    })
    assert res2.status_code == 409

def test_invalid_input(engineer_token):
    # End date before start date
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-01-02T10:00:00Z", "end_date": "2025-01-01T10:00:00Z"
    })
    assert res1.status_code == 400
    
    # Nonexistent equipment
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 999, "site_id": 1, "priority": 1,
        "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-02T10:00:00Z"
    })
    assert res2.status_code == 404

def test_back_to_back_booking(engineer_token):
    # Book Jan 1 10:00 to Jan 2 10:00 at Site 1
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-01T10:00:00Z", "end_date": "2025-01-02T10:00:00Z"
    })
    assert res1.status_code == 200
    
    # Book Jan 2 10:00 to Jan 3 10:00 at Site 1 (same site, buffer=0)
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-02T10:00:00Z", "end_date": "2025-01-03T10:00:00Z"
    })
    # Should succeed because it starts exactly when the previous one ends
    assert res2.status_code == 200

def test_non_overlapping_shifts(engineer_token):
    # Morning shift booking
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-01T08:00:00Z", "end_date": "2025-01-01T12:00:00Z", "shift": "morning"
    })
    assert res1.status_code == 200

    # Afternoon shift booking same day, same equipment
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-01T13:00:00Z", "end_date": "2025-01-01T17:00:00Z", "shift": "afternoon"
    })
    assert res2.status_code == 200

def test_overlapping_shifts_with_full_day(engineer_token):
    # Full day booking
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-01-02T08:00:00Z", "end_date": "2025-01-02T17:00:00Z", "shift": "full_day"
    })
    assert res1.status_code == 200

    # Morning shift should conflict with full_day
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-01-02T08:00:00Z", "end_date": "2025-01-02T12:00:00Z", "shift": "morning"
    })
    assert res2.status_code == 409

def test_transport_buffer_shift_violation(engineer_token):
    # Morning at Site 1
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-02-01T08:00:00Z", "end_date": "2025-02-01T12:00:00Z", "shift": "morning"
    })
    assert res1.status_code == 200

    # Afternoon same day at Site 2 - transport buffer (default 4h) not satisfied (12:00 -> 13:00)
    res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 2, "priority": 1,
        "start_date": "2025-02-01T13:00:00Z", "end_date": "2025-02-01T17:00:00Z", "shift": "afternoon"
    })
    assert res2.status_code == 409

def test_transport_buffer_shift_satisfied(engineer_token):
    # Reset DB for clarity: existing approved bookings are isolated per test via fixture
    # Morning at Site 1
    res1 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-03-01T08:00:00Z", "end_date": "2025-03-01T12:00:00Z", "shift": "morning"
    })
    assert res1.status_code == 200

    # Temporarily lower transport buffer
    import config as _config
    original = _config.TRANSPORT_BUFFER_HOURS
    _config.TRANSPORT_BUFFER_HOURS = 1
    try:
        res2 = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
            "equipment_id": 1, "site_id": 2, "priority": 1,
            "start_date": "2025-03-01T13:00:00Z", "end_date": "2025-03-01T17:00:00Z", "shift": "afternoon"
        })
    finally:
        _config.TRANSPORT_BUFFER_HOURS = original

    assert res2.status_code == 200

def test_shift_aware_maintenance_allowed(engineer_token, manager_token):
    # Schedule maintenance in afternoon on Feb 5
    res_m = client.post("/api/maintenance", headers={"Authorization": f"Bearer {manager_token}"}, json={
        "equipment_id": 1, "start_date": "2025-02-05T13:00:00Z", "end_date": "2025-02-05T17:00:00Z", "description": "Afternoon routine"
    })
    assert res_m.status_code == 200

    # Morning booking same day should be allowed
    res_b = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 2,
        "start_date": "2025-02-05T08:00:00Z", "end_date": "2025-02-05T12:00:00Z", "shift": "morning"
    })
    assert res_b.status_code == 200

def test_shift_aware_maintenance_conflict(engineer_token, manager_token):
    # Schedule maintenance in morning on Feb 6
    res_m = client.post("/api/maintenance", headers={"Authorization": f"Bearer {manager_token}"}, json={
        "equipment_id": 1, "start_date": "2025-02-06T08:00:00Z", "end_date": "2025-02-06T12:00:00Z", "description": "Morning routine"
    })
    assert res_m.status_code == 200

    # Morning booking same day should conflict
    res_b = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-02-06T08:00:00Z", "end_date": "2025-02-06T12:00:00Z", "shift": "morning"
    })
    assert res_b.status_code == 409

def test_full_day_blocked_by_morning_maintenance(engineer_token, manager_token):
    # Schedule morning maintenance
    res_m = client.post("/api/maintenance", headers={"Authorization": f"Bearer {manager_token}"}, json={
        "equipment_id": 1, "start_date": "2025-04-01T08:00:00Z", "end_date": "2025-04-01T12:00:00Z", "description": "Morning"
    })
    assert res_m.status_code == 200

    # Full day booking should be blocked
    res_b = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-04-01T08:00:00Z", "end_date": "2025-04-01T17:00:00Z", "shift": "full_day"
    })
    assert res_b.status_code == 409

def test_full_day_blocked_by_afternoon_maintenance(engineer_token, manager_token):
    # Schedule afternoon maintenance
    res_m = client.post("/api/maintenance", headers={"Authorization": f"Bearer {manager_token}"}, json={
        "equipment_id": 1, "start_date": "2025-04-02T13:00:00Z", "end_date": "2025-04-02T17:00:00Z", "description": "Afternoon"
    })
    assert res_m.status_code == 200

    # Full day booking should be blocked
    res_b = client.post("/api/bookings", headers={"Authorization": f"Bearer {engineer_token}"}, json={
        "equipment_id": 1, "site_id": 1, "priority": 1,
        "start_date": "2025-04-02T08:00:00Z", "end_date": "2025-04-02T17:00:00Z", "shift": "full_day"
    })
    assert res_b.status_code == 409
