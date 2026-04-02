from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class InvoiceExtraction(BaseModel):
    vendor: str = Field(..., description="Name of the vendor")
    amount: float = Field(..., description="Total amount of the invoice")
    currency: str = Field("USD", description="Currency of the amount")
    date: str = Field(..., description="Date of the invoice (YYYY-MM-DD)")
    invoice_number: str = Field(..., description="Invoice number")
    items: Optional[List[dict]] = Field(None, description="Line items if available")

class InvoiceRecord(BaseModel):
    id: Optional[str] = None
    vendor: str
    amount: float
    currency: str
    date: str
    invoice_number: str
    file_url: str
    raw_text: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: Optional[str] = None
