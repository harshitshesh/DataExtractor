import os
import logging
from supabase import create_client, Client
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_url: str = os.getenv("SUPABASE_URL", "")
_key: str = os.getenv("SUPABASE_KEY", "")

# Only initialize if a valid URL is provided
supabase: Client = None
if _url and _url.startswith("http") and _key:
    try:
        supabase = create_client(_url, _key)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
else:
    logger.error("SUPABASE_URL or SUPABASE_KEY not found or invalid.")

def upload_to_storage(bucket: str, file_path: str, destination_path: str) -> str:
    """Upload a file to Supabase storage and return the URL."""
    if not supabase:
        logger.error("Supabase client not initialized, skipping storage upload.")
        return ""
    
    try:
        with open(file_path, "rb") as f:
            file_data = f.read()
        
        # Try to upload; if file exists, try removing and re-uploading
        try:
            supabase.storage.from_(bucket).upload(
                destination_path, 
                file_data,
                file_options={"content-type": "application/octet-stream"}
            )
        except Exception as upload_err:
            err_str = str(upload_err).lower()
            if "duplicate" in err_str or "already exists" in err_str or "409" in err_str:
                logger.warning(f"File already exists in storage, removing and re-uploading: {destination_path}")
                try:
                    supabase.storage.from_(bucket).remove([destination_path])
                except Exception:
                    pass
                supabase.storage.from_(bucket).upload(
                    destination_path,
                    file_data,
                    file_options={"content-type": "application/octet-stream"}
                )
            else:
                raise upload_err
        
        # Get public URL
        res = supabase.storage.from_(bucket).get_public_url(destination_path)
        public_url = getattr(res, 'public_url', res) if not isinstance(res, str) else res
        logger.info(f"File uploaded to storage: {public_url}")
        return public_url
    except Exception as e:
        logger.error(f"Error in Supabase storage upload: {e}")
        # Don't raise — allow pipeline to continue even if storage fails
        return ""

def insert_invoice(data: dict) -> dict:
    """Insert extraction result into invoices table."""
    if not supabase:
        raise Exception("Supabase client not initialized. Check SUPABASE_URL and SUPABASE_KEY.")
    
    try:
        res = supabase.table("invoices").insert(data).execute()
        if hasattr(res, 'data') and res.data:
            logger.info(f"Invoice inserted successfully: {res.data[0].get('id', 'N/A')}")
            return res.data[0]
        else:
            raise Exception("Insert operation returned no data.")
    except Exception as e:
        logger.error(f"Error in Supabase DB insert: {e}")
        raise Exception(f"Database sync failed. Error: {str(e)}")

def get_invoices() -> List[dict]:
    """Retrieve all processed invoices."""
    if not supabase:
        logger.error("Supabase client not initialized.")
        return []
    
    try:
        res = supabase.table("invoices").select("*").order("created_at", desc=True).execute()
        return res.data if hasattr(res, 'data') else []
    except Exception as e:
        logger.error(f"Error in Supabase DB query: {e}")
        return []

def check_duplicate(vendor: str, invoice_number: str) -> Optional[dict]:
    """Check if an invoice with same vendor and number already exists."""
    if not supabase:
        return None
    
    try:
        res = supabase.table("invoices").select("*").eq("vendor", vendor).eq("invoice_number", invoice_number).execute()
        return res.data[0] if (hasattr(res, 'data') and res.data) else None
    except Exception as e:
        logger.error(f"Error in duplicate check: {e}")
        return None
