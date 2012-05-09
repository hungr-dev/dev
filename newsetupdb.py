from models import db
from models import User
from models import Address

def create():
    db.create_all()

def seed():
    addr1 = Address(0,0,0,"1026 Commonwealth Ave", "Boston", "MA", "02115")
    addr2 = Address(0,0,0,"1260 Boylston St", "Boston", "MA", "02115")

    db.session.add(addr1)
    db.session.add(addr2)
    db.session.commit()
