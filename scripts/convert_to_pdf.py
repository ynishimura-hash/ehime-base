from docx2pdf import convert
import os
import sys

def convert_invoices_to_pdf(target_dir):
    print(f"Target directory: {target_dir}")
    
    if not os.path.exists(target_dir):
        print("Directory not found!")
        return

    # Convert all docx files in the directory
    try:
        print("Starting conversion... Microsoft Word will open.")
        convert(target_dir)
        print("Conversion complete.")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    target_directory = "/Users/yuyu24/Downloads/個人事業請求書"
    convert_invoices_to_pdf(target_directory)
