from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# ---------------- SUPPLIERS ---------------- #

class SupplierBase(BaseModel):
    name: str
    phone: str
    location: str
    supplier_type: str


class SupplierCreate(SupplierBase):
    pass


class Supplier(SupplierBase):
    id: int

    class Config:
        orm_mode = True


# ---------------- PURCHASES ---------------- #

class PurchaseBase(BaseModel):
    supplier_id: int
    supplier_name: str
    bottle_brand: str
    quantity: int
    buying_price: float
    quality_rating: str
    payment_status: str
    notes: Optional[str] = None


class PurchaseCreate(PurchaseBase):
    pass


class Purchase(PurchaseBase):
    id: int
    purchase_date: date

    class Config:
        orm_mode = True


# ---------------- AI CHAT ---------------- #

class ChatRequest(BaseModel):
    message: str


# ---------------- PERSISTENT MEMORY ---------------- #

class SupplierMemoryCreate(BaseModel):
    supplier_name: str
    note: str


class SupplierMemoryResponse(BaseModel):
    id: int
    supplier_name: str
    note: str
    created_at: datetime

    class Config:
        orm_mode = True