from database import SessionLocal, engine
from models import Base, User, Site, Equipment, UserRole, EquipmentStatus
from auth import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if we already seeded
    if db.query(User).first():
        print("Database already seeded.")
        return

    # Create Users
    manager = User(username="manager1", hashed_password=get_password_hash("pass123"), role=UserRole.manager)
    engineer = User(username="engineer1", hashed_password=get_password_hash("pass123"), role=UserRole.site_engineer)
    db.add(manager)
    db.add(engineer)

    # Create Sites
    site_a = Site(name="Downtown Highrise", location="City Center")
    site_b = Site(name="Northside Hospital", location="North District")
    db.add(site_a)
    db.add(site_b)

    # Create Equipment
    excavator1 = Equipment(name="EX-001", type="Excavator", status=EquipmentStatus.available)
    crane1 = Equipment(name="CR-001", type="Crane", status=EquipmentStatus.available)
    mixer1 = Equipment(name="MX-001", type="Concrete Mixer", status=EquipmentStatus.available)
    db.add(excavator1)
    db.add(crane1)
    db.add(mixer1)

    db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
