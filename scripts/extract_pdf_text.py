from pypdf import PdfReader
import sys

def extract_text(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        print(text)
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    pdf_path = "/Users/yuyu24/Downloads/【確定】外注費_西村友祐様.pdf"
    extract_text(pdf_path)
