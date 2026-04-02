import pytesseract
from PIL import Image
import os
from pdf2image import convert_from_path
import tempfile
from dotenv import load_dotenv

load_dotenv()

# Set tesseract path
# In Docker, it's usually at /usr/bin/tesseract
tesseract_path = os.getenv("TESSERACT_PATH", "/usr/bin/tesseract")
if os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
else:
    # If not found, try default system command
    pytesseract.pytesseract.tesseract_cmd = "tesseract"

def extract_text(file_path: str) -> str:
    """Extract text from image or PDF using Tesseract."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext in [".pdf"]:
        return extract_from_pdf(file_path)
    elif file_ext in [".jpg", ".jpeg", ".png"]:
        return extract_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")

def extract_from_image(image_path: str) -> str:
    """Extract text from a single image with preprocessing for better accuracy."""
    try:
        img = Image.open(image_path)
        
        # Preprocessing for better OCR accuracy
        # Convert to grayscale
        img = img.convert('L')
        
        # Optional: Thresholding or resizing could be added here
        # But for Gemini, even raw OCR text is usually enough if it's clear
        
        text = pytesseract.image_to_string(img, config='--oem 3 --psm 6')
        
        if not text.strip():
            # Try without custom config if it returns nothing
            text = pytesseract.image_to_string(img)
            
        return text.strip()
    except Exception as e:
        print(f"Error in OCR image extraction: {e}")
        return ""

def extract_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF by converting pages to images."""
    try:
        # Convert PDF pages to PIL Images
        pages = convert_from_path(pdf_path)
        full_text = ""
        for page in pages:
            text = pytesseract.image_to_string(page)
            full_text += text + "\n"
        return full_text.strip()
    except Exception as e:
        print(f"Error in OCR PDF extraction: {e}")
        return ""
