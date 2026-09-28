from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    location = Column(String)
    supplier_type = Column(String)

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, index=True)
    supplier_name = Column(String)
    purchase_date = Column(Date, default=datetime.utcnow)
    bottle_brand = Column(String)
    quantity = Column(Integer)
    buying_price = Column(Float)
    quality_rating = Column(String)
    payment_status = Column(String)
    notes = Column(Text, nullable=True)


class SupplierMemory(Base):
    __tablename__ = "supplier_memory"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, index=True)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
