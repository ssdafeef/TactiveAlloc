from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from database import Base

class UserRole(str, enum.Enum):
    site_engineer = "site_engineer"
    manager = "manager"

class EquipmentStatus(str, enum.Enum):
    available = "available"
    maintenance = "maintenance"
    booked = "booked"

class BookingStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    displaced = "displaced"
    rejected = "rejected"

class BookingShift(str, enum.Enum):
    morning = "morning"
    afternoon = "afternoon"
    full_day = "full_day"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.site_engineer)

class Site(Base):
    __tablename__ = "sites"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # e.g., excavator, crane
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.available)
    bookings = relationship("Booking", back_populates="equipment")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    site_id = Column(Integer, ForeignKey("sites.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    priority = Column(Integer, default=1) # 1 highest, 2 medium, etc.
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    resolution_note = Column(String, nullable=True)
    shift = Column(Enum(BookingShift), default=BookingShift.full_day)

    equipment = relationship("Equipment", back_populates="bookings")
    site = relationship("Site")
    user = relationship("User")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    description = Column(String)

    equipment = relationship("Equipment")
