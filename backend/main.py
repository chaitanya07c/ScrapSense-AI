from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
import database
import hindsight_memory


# --------------- SAMPLE SEED DATA --------------- #

SAMPLE_PURCHASES = [
    {
        "supplier_id": 1,
        "supplier_name": "Sri Durga Wines",
        "bottle_brand": "Kingfisher",
        "quantity": 120,
        "buying_price": 8.5,
        "quality_rating": "Excellent",
        "payment_status": "Completed",
        "notes": "Regular supplier",
    },
    {
        "supplier_id": 2,
        "supplier_name": "Balaji Scrap Traders",
        "bottle_brand": "Tuborg",
        "quantity": 80,
        "buying_price": 6.2,
        "quality_rating": "Good",
        "payment_status": "Pending",
        "notes": "Payment due",
    },
    {
        "supplier_id": 3,
        "supplier_name": "Sai Krishna Hotel",
        "bottle_brand": "Kingfisher",
        "quantity": 150,
        "buying_price": 8.8,
        "quality_rating": "Poor",
        "payment_status": "Completed",
        "notes": "Broken bottles found",
    },
    {
        "supplier_id": 4,
        "supplier_name": "Akividu Wine Mart",
        "bottle_brand": "Kingfisher",
        "quantity": 100,
        "buying_price": 8.4,
        "quality_rating": "Excellent",
        "payment_status": "Completed",
        "notes": "Best quality",
    },
]


def seed_purchases(db: Session) -> None:
    """Insert sample purchases only when the table is empty."""
    existing = db.query(models.Purchase).count()
    if existing == 0:
        today = datetime.utcnow().date()
        for record in SAMPLE_PURCHASES:
            db.add(models.Purchase(purchase_date=today, **record))
        db.commit()
        print(f"[Seed] Inserted {len(SAMPLE_PURCHASES)} sample purchase records.")
    else:
        print(f"[Seed] Skipped — {existing} purchase record(s) already exist.")


# --------------- LIFESPAN --------------- #

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables exist, then seed if empty
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    try:
        seed_purchases(db)
    finally:
        db.close()
    yield  # Application runs here


app = FastAPI(title="ScrapSense AI", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- SUPPLIERS ---------------- #

@app.get("/suppliers", response_model=list[schemas.Supplier])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()


@app.post("/suppliers", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


# ---------------- PURCHASES ---------------- #

@app.get("/purchases", response_model=list[schemas.Purchase])
def get_purchases(db: Session = Depends(get_db)):
    return db.query(models.Purchase).all()


@app.post("/purchases", response_model=schemas.Purchase)
def create_purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db)):
    db_purchase = models.Purchase(**purchase.dict())
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)

    # Save into Hindsight memory
    memory = hindsight_memory.HindsightMemory(db)
    memory.add_memory(db_purchase)

    return db_purchase


# ---------------- AI CHAT ---------------- #

@app.post("/chat")
def chat_with_agent(req: schemas.ChatRequest, db: Session = Depends(get_db)):
    memory = hindsight_memory.HindsightMemory(db)

    # Get intelligent response from memory
    answer = memory.query_memory(req.message)

    return {
        "response": answer
    }


# ---------------- MEMORY ---------------- #

@app.post("/memory", response_model=schemas.SupplierMemoryResponse)
def save_memory(payload: schemas.SupplierMemoryCreate, db: Session = Depends(get_db)):
    """Persist a free-text note for a supplier into the supplier_memory table."""
    entry = models.SupplierMemory(
        supplier_name=payload.supplier_name,
        note=payload.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/memory/{supplier_name}", response_model=list[schemas.SupplierMemoryResponse])
def get_memory(supplier_name: str, db: Session = Depends(get_db)):
    """Retrieve all remembered notes for a given supplier."""
    return (
        db.query(models.SupplierMemory)
        .filter(func.lower(models.SupplierMemory.supplier_name) == supplier_name.lower())
        .order_by(models.SupplierMemory.created_at.desc())
        .all()
    )



@app.get("/")
def root():
    return {
        "message": "ScrapSense AI Backend Running"
    }