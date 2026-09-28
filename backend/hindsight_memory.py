"""
hindsight_memory.py - ScrapSense AI Natural Language Query Engine
-----------------------------------------------------------------
Routes free-text questions to precise SQLAlchemy queries and returns
clean plain-English answers. No external LLM dependency required.

Intent pipeline (first match wins):
  0. save_memory       - "Remember <Supplier> <note>"
  1. best_quality      - "Which supplier has the best quality?"
  2. worst_quality     - "Which supplier has the worst quality?"
  3. pending_payments  - "Show all pending payments"
  4. average_price     - "Average price of Kingfisher"
  5. total_quantity    - "How many bottles from Sri Durga Wines?"
  6. brand_supplier    - "Which supplier sold Tuborg?"
  7. purchase_history  - "Show purchase history of Balaji Scrap Traders"
  8. supplier_summary  - "Tell me about Sri Durga Wines"
  9. fallback
"""

from sqlalchemy import func
from models import Purchase, SupplierMemory


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

QUALITY_RANK = {"excellent": 3, "good": 2, "poor": 1}


def _rank(rating: str) -> int:
    return QUALITY_RANK.get(rating.lower(), 0)


def _all_supplier_names(db) -> list:
    """Return distinct supplier names from purchases, longest-first."""
    names = [row[0] for row in db.query(Purchase.supplier_name).distinct().all()]
    names.sort(key=len, reverse=True)
    return names


def _find_supplier_name(q: str, db) -> str | None:
    """
    Finds a supplier using either:
    - Full name: 'Sri Durga Wines'
    - Short name: 'Sri Durga'
    """
    suppliers = _all_supplier_names(db)

    for name in suppliers:
        full = name.lower()

        # Full supplier name match
        if full in q:
            return name

        # Short name match (first two words)
        words = full.split()
        if len(words) >= 2:
            short = " ".join(words[:2])
            if short in q:
                return name

        # First word fallback
        if words and words[0] in q:
            return name

    return None


def _purchases_for(supplier_name: str, db) -> list:
    """Return all purchases for a supplier, newest first."""
    return (
        db.query(Purchase)
        .filter(func.lower(Purchase.supplier_name) == supplier_name.lower())
        .order_by(Purchase.purchase_date.desc())
        .all()
    )


def _find_brand(q: str, db) -> str | None:
    """Return the first bottle brand whose name appears in the question."""
    brands = [row[0] for row in db.query(Purchase.bottle_brand).distinct().all()]
    brands.sort(key=len, reverse=True)
    for brand in brands:
        if brand.lower() in q:
            return brand
    return None


# ---------------------------------------------------------------------------
# Intent 0 - Save Memory
# ---------------------------------------------------------------------------

# Phrases that signal a "remember this" request
_SAVE_TRIGGERS = ["remember ", "note that ", "keep in mind ", "don't forget "]


def _intent_save_memory(self, question: str):
    q = question.lower().strip()

    # Trigger words
    triggers = ["remember ", "note that ", "save memory "]

    trigger_used = None
    for t in triggers:
        if q.startswith(t):
            trigger_used = t
            break

    if not trigger_used:
        return None

    # Remove trigger word
    original = question.strip()
    after_trigger = original[len(trigger_used):]

    # Find supplier using partial name
    supplier_name = _find_supplier_name(after_trigger.lower(), self.db)

    if not supplier_name:
        return "Supplier not found."

    # Remove supplier name from note
    note = after_trigger
    full = supplier_name
    short = " ".join(full.split()[:2])

    if note.lower().startswith(full.lower()):
        note = note[len(full):].strip()
    elif note.lower().startswith(short.lower()):
        note = note[len(short):].strip()

    # Save memory
    memory = SupplierMemory(
        supplier_name=supplier_name,
        note=note
    )

    self.db.add(memory)
    self.db.commit()

    return f"Memory saved for {supplier_name}."


# ---------------------------------------------------------------------------
# Intent 1 - Best Quality
# ---------------------------------------------------------------------------

def _intent_best_quality(q: str, db) -> str | None:
    triggers = ["best quality", "highest quality", "top quality",
                "best supplier", "which supplier is best"]
    if not any(t in q for t in triggers):
        return None

    rows = db.query(Purchase).all()
    if not rows:
        return "No purchase records found."

    best = max(rows, key=lambda p: _rank(p.quality_rating))
    return (
        f"{best.supplier_name} has the best quality rating of {best.quality_rating} "
        f"for {best.bottle_brand} ({best.quantity} bottles at Rs {best.buying_price:.2f} each)."
    )


# ---------------------------------------------------------------------------
# Intent 2 - Worst Quality
# ---------------------------------------------------------------------------

def _intent_worst_quality(q: str, db) -> str | None:
    triggers = ["worst quality", "lowest quality", "poor quality", "bad quality"]
    if not any(t in q for t in triggers):
        return None

    rows = db.query(Purchase).all()
    if not rows:
        return "No purchase records found."

    worst = min(rows, key=lambda p: _rank(p.quality_rating))
    return (
        f"{worst.supplier_name} has the lowest quality rating of {worst.quality_rating} "
        f"for {worst.bottle_brand} ({worst.quantity} bottles at Rs {worst.buying_price:.2f} each)."
    )


# ---------------------------------------------------------------------------
# Intent 3 - Pending Payments
# ---------------------------------------------------------------------------

def _intent_pending_payments(q: str, db) -> str | None:
    triggers = ["pending", "unpaid", "dues", "outstanding payment"]
    if not any(t in q for t in triggers):
        return None

    rows = (
        db.query(Purchase)
        .filter(func.lower(Purchase.payment_status) == "pending")
        .all()
    )
    if not rows:
        return "No pending payments. All suppliers have been paid."

    lines = ["Pending Payments:"]
    for p in rows:
        total = p.buying_price * p.quantity
        lines.append(
            f"{p.supplier_name} - {p.quantity} {p.bottle_brand} bottles, "
            f"total Rs {total:,.0f} due."
        )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Intent 4 - Average Price
# ---------------------------------------------------------------------------

def _intent_average_price(q: str, db) -> str | None:
    # Match "average price", "avg price", etc.  Also match split phrases like
    # "average Kingfisher price" where a brand sits between "average" and "price".
    consecutive = ["average price", "avg price", "mean price", "average buying", "average cost"]
    split = ("average" in q or "avg" in q) and "price" in q

    if not any(t in q for t in consecutive) and not split:
        return None

    brand = _find_brand(q, db)

    if brand:
        result = (
            db.query(func.avg(Purchase.buying_price))
            .filter(func.lower(Purchase.bottle_brand) == brand.lower())
            .scalar()
        )
        if result is None:
            return f"No purchases found for {brand}."
        return f"The average buying price of {brand} is Rs {result:.2f} per bottle."

    result = db.query(func.avg(Purchase.buying_price)).scalar()
    if result is None:
        return "No purchase records found."
    return f"The overall average buying price across all brands is Rs {result:.2f} per bottle."


# ---------------------------------------------------------------------------
# Intent 5 - Total Quantity
# ---------------------------------------------------------------------------

def _intent_total_quantity(q: str, db) -> str | None:
    triggers = [
        "how many bottles", "total bottles", "total quantity",
        "bottles did we buy", "how much did we buy", "quantity purchased",
        "bottles bought", "how many did we buy",
    ]
    if not any(t in q for t in triggers):
        return None

    supplier_name = _find_supplier_name(q, db)

    if supplier_name:
        rows = _purchases_for(supplier_name, db)
        total = sum(p.quantity for p in rows)
        breakdown: dict[str, int] = {}
        for p in rows:
            breakdown[p.bottle_brand] = breakdown.get(p.bottle_brand, 0) + p.quantity
        breakdown_str = ", ".join(f"{qty} {brand}" for brand, qty in breakdown.items())
        return (
            f"We bought a total of {total} bottles from {supplier_name}. "
            f"Breakdown: {breakdown_str}."
        )

    total = db.query(func.sum(Purchase.quantity)).scalar() or 0
    return f"Total bottles purchased across all suppliers: {total:,}."


# ---------------------------------------------------------------------------
# Intent 6 - Which Supplier for Brand
# ---------------------------------------------------------------------------

def _intent_brand_supplier(q: str, db) -> str | None:
    triggers = ["who sells", "which supplier sells", "who sold", "which supplier sold",
                "who supplies", "which supplier supplies", "supplier for"]
    if not any(t in q for t in triggers):
        return None

    brand = _find_brand(q, db)
    if not brand:
        return None

    rows = (
        db.query(Purchase)
        .filter(func.lower(Purchase.bottle_brand) == brand.lower())
        .all()
    )
    if not rows:
        return f"No suppliers found for {brand} in our records."

    suppliers = list({p.supplier_name for p in rows})
    if len(suppliers) == 1:
        return f"{brand} is supplied by {suppliers[0]}."
    return f"{brand} is supplied by: {', '.join(suppliers)}."


# ---------------------------------------------------------------------------
# Intent 7 - Purchase History
# ---------------------------------------------------------------------------

def _intent_purchase_history(q: str, db) -> str | None:
    triggers = ["purchase history", "history of", "show history", "all purchases from",
                "purchases of", "transaction history", "show purchases"]
    if not any(t in q for t in triggers):
        return None

    supplier_name = _find_supplier_name(q, db)

    if not supplier_name:
        rows = (
            db.query(Purchase)
            .order_by(Purchase.purchase_date.desc())
            .limit(5)
            .all()
        )
        if not rows:
            return "No purchase history found."
        lines = ["Recent Purchase History (last 5):"]
        for p in rows:
            lines.append(
                f"{p.purchase_date} - {p.supplier_name}: "
                f"{p.quantity} {p.bottle_brand} at Rs {p.buying_price:.2f}, "
                f"Quality: {p.quality_rating}, Payment: {p.payment_status}."
            )
        return "\n".join(lines)

    rows = _purchases_for(supplier_name, db)
    lines = [f"Purchase History for {supplier_name}:"]
    for p in rows:
        lines.append(
            f"{p.purchase_date} - {p.quantity} {p.bottle_brand} bottles "
            f"at Rs {p.buying_price:.2f} each. Quality: {p.quality_rating}. "
            f"Payment: {p.payment_status}."
        )
        if p.notes:
            lines.append(f"Note: {p.notes}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Intent 8 - Supplier Summary (catch-all for any supplier mention)
# ---------------------------------------------------------------------------

def _intent_supplier_summary(q: str, db) -> str | None:
    """
    Triggered whenever a known supplier name appears in the question.
    Returns purchase summary AND any remembered notes from SupplierMemory.
    """
    supplier_name = _find_supplier_name(q, db)
    if not supplier_name:
        return None

    rows = _purchases_for(supplier_name, db)
    if not rows:
        return f"No purchase records found for {supplier_name}."

    p = rows[0]
    total_qty = sum(x.quantity for x in rows)
    avg_price = sum(x.buying_price for x in rows) / len(rows)

    lines = [
        f"{supplier_name}:",
        (
            f"Latest purchase on {p.purchase_date} - "
            f"{p.quantity} {p.bottle_brand} bottles at Rs {p.buying_price:.2f}."
        ),
        f"Quality: {p.quality_rating}. Payment: {p.payment_status}.",
        f"Total bottles purchased: {total_qty}. Average price: Rs {avg_price:.2f}.",
    ]
    if p.notes:
        lines.append(f"Purchase note: {p.notes}")

    # Fetch and append remembered notes
    memories = (
        db.query(SupplierMemory)
        .filter(func.lower(SupplierMemory.supplier_name) == supplier_name.lower())
        .order_by(SupplierMemory.created_at.desc())
        .all()
    )
    if memories:
        lines.append("Remembered notes:")
        for m in memories:
            lines.append(f"- {m.note}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Fallback
# ---------------------------------------------------------------------------

def _intent_fallback(db) -> str:
    return (
        "Sorry, I couldn't understand that question. "
        "Please ask about suppliers, prices, quality, pending payments, or purchase history."
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Ordered pipeline — first handler that returns a non-None value wins.
INTENT_PIPELINE = [
    _intent_save_memory,        # MUST be first — catches "Remember ..." before supplier-summary
    _intent_best_quality,
    _intent_worst_quality,
    _intent_pending_payments,
    _intent_average_price,
    _intent_total_quantity,
    _intent_brand_supplier,
    _intent_purchase_history,
    _intent_supplier_summary,
]


class HindsightMemory:
    def __init__(self, db):
        self.db = db

    def add_memory(self, purchase: Purchase):
        """Called after a purchase is added."""
        pass

    def query_memory(self, question: str):
        db = self.db
        q = question.lower().strip()

        # =====================================================
        # CHEAPEST SUPPLIER
        # =====================================================
        if "cheapest supplier" in q:
            item = (
                db.query(Purchase)
                .order_by(Purchase.buying_price.asc())
                .first()
            )

            if not item:
                return "No purchase records found."

            return (
                f"Cheapest supplier: {item.supplier_name}\n"
                f"Brand: {item.bottle_brand}\n"
                f"Price: Rs {item.buying_price:.2f} per bottle\n"
                f"Quantity Purchased: {item.quantity}\n"
                f"Quality: {item.quality_rating}"
            )

        # =====================================================
        # BEST SUPPLIER FOR KINGFISHER
        # =====================================================
        if "best supplier for kingfisher" in q:
            item = (
                db.query(Purchase)
                .filter(func.lower(Purchase.bottle_brand) == "kingfisher")
                .filter(func.lower(Purchase.quality_rating) == "excellent")
                .order_by(Purchase.buying_price.asc())
                .first()
            )

            if item:
                return (
                    f"{item.supplier_name} is the best supplier for Kingfisher.\n"
                    f"Price: Rs {item.buying_price:.2f}\n"
                    f"Quality: Excellent"
                )

        # =====================================================
        # HIGHEST QUALITY SUPPLIER
        # =====================================================
        if "highest quality supplier" in q or "highest quality" in q:
            items = (
                db.query(Purchase)
                .filter(func.lower(Purchase.quality_rating) == "excellent")
                .all()
            )

            if items:
                names = sorted(set(i.supplier_name for i in items))
                return "Highest quality suppliers: " + ", ".join(names)

        # =====================================================
        # WEEKLY BUSINESS SUMMARY
        # =====================================================
        if (
            "weekly summary" in q
            or "business summary" in q
            or "this week" in q
        ):

            purchases = db.query(Purchase).all()

            if not purchases:
                return "No purchase data available."

            total_bottles = sum(p.quantity for p in purchases)
            total_spent = sum(p.quantity * p.buying_price for p in purchases)
            avg_price = total_spent / total_bottles if total_bottles else 0

            best = (
                db.query(Purchase)
                .filter(func.lower(Purchase.quality_rating) == "excellent")
                .order_by(Purchase.buying_price.asc())
                .first()
            )

            pending = (
                db.query(Purchase)
                .filter(func.lower(Purchase.payment_status) == "pending")
                .count()
            )

            return (
                f"WEEKLY BUSINESS SUMMARY\n\n"
                f"Total purchases : {len(purchases)}\n"
                f"Total bottles   : {total_bottles}\n"
                f"Total spending  : Rs {total_spent:.2f}\n"
                f"Average price   : Rs {avg_price:.2f}\n"
                f"Pending payments: {pending}\n\n"
                f"Best Supplier:\n"
                f"{best.supplier_name}\n"
                f"Price : Rs {best.buying_price:.2f}\n"
                f"Quality : Excellent"
            )

        # =====================================================
        # EXISTING INTENT PIPELINE
        # =====================================================
        for handler in INTENT_PIPELINE:

            if handler == _intent_save_memory:
                result = handler(self, question)
            else:
                result = handler(q, db)

            if result is not None:
                return result

        return _intent_fallback(db)