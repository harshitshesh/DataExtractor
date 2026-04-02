from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from typing import List, Optional
from services.ocr_service import extract_text
from services.llm_service import extract_structured_data
from services.supabase_service import upload_to_storage, insert_invoice, get_invoices, check_duplicate
from models.invoice import InvoiceExtraction, InvoiceRecord
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Invoice Extraction API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a temp directory for local processing
TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/upload")
async def process_invoice(file: UploadFile = File(...)):
    """Upload, extract, parse, and store invoice data."""
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(TEMP_DIR, f"{file_id}{file_ext}")

    # Save to local temp for processing
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 1. OCR Extraction
        ocr_text = extract_text(temp_path)
        if not ocr_text:
            raise HTTPException(status_code=400, detail="Could not extract text from file.")
        
        # 2. LLM Extraction
        extraction = extract_structured_data(ocr_text)
        if not extraction:
            raise HTTPException(status_code=500, detail="AI parsing failed.")
        
        # 3. Duplicate Detection
        vendor = extraction.get("vendor", "Unknown")
        invoice_num = extraction.get("invoice_number", "Unknown")
        duplicate = check_duplicate(vendor, invoice_num)
        
        if duplicate:
            return {"status": "duplicate", "message": "This invoice has already been processed.", "data": duplicate}

        # 4. Storage Upload
        file_url = f"https://example.com/uploads/{file.filename}" # Default fallback
        bucket_res = upload_to_storage("invoices", temp_path, f"{file_id}{file_ext}")
        if bucket_res: 
            file_url = bucket_res

        # 5. Database Store
        record = {
            "vendor": vendor,
            "buyer_name": extraction.get("buyer_name"),
            "amount": float(extraction.get("amount", 0)) if extraction.get("amount") is not None else 0,
            "tax_amount": float(extraction.get("tax_amount")) if extraction.get("tax_amount") is not None else None,
            "currency": extraction.get("currency", "USD"),
            "date": extraction.get("date", ""),
            "due_date": extraction.get("due_date", ""),
            "payment_status": extraction.get("payment_status", ""),
            "invoice_number": invoice_num,
            "gst_number": extraction.get("gst_number", ""),
            "file_url": file_url,
            "raw_text": ocr_text,
            "confidence_score": 0.95, # Mock confidence score for LLM
        }
        
        db_res = insert_invoice(record)
        
        return {"status": "success", "data": db_res}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/invoices")
async def get_all_invoices():
    """Retrieve list of all processed invoices."""
    return get_invoices()

@app.get("/analytics")
async def get_analytics():
    """Aggregate data for the dashboard."""
    invoices = get_invoices()
    
    total_count = len(invoices)
    total_spend = sum(float(inv["amount"]) for inv in invoices)
    
    vendor_aggregation = {}
    currency_aggregation = {}
    for inv in invoices:
        v = inv["vendor"]
        c = inv["currency"]
        amt = float(inv["amount"])
        vendor_aggregation[v] = vendor_aggregation.get(v, 0) + amt
        currency_aggregation[c] = currency_aggregation.get(c, 0) + amt
    
    return {
        "total_count": total_count,
        "total_spend": total_spend,
        "vendor_spend": vendor_aggregation,
        "currency_spend": currency_aggregation,
        "recent_invoices": invoices[:10]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
