from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
import os
import datetime
from dateutil.relativedelta import relativedelta

def register_font():
    # CIDフォントを使用する（ファイルパス不要、最も互換性が高い）
    # HeiseiKakuGo-W5 は太字のゴシック体
    font_name = "HeiseiKakuGo-W5"
    try:
        pdfmetrics.registerFont(UnicodeCIDFont(font_name))
        return font_name
    except Exception as e:
        print(f"Font registration warning: {e}")
        return "Helvetica"

def create_pdf_invoice(date_str, amount_str, output_filename):
    c = canvas.Canvas(output_filename, pagesize=A4)
    width, height = A4
    font_name = register_font()

    # Title
    c.setFont(font_name, 24)
    c.drawCentredString(width / 2, height - 30 * mm, "請 求 書")

    # Header Info
    c.setFont(font_name, 16)
    # Recipient
    c.drawString(20 * mm, height - 60 * mm, "合同会社EIS 御中")
    c.setFont(font_name, 12)
    c.drawString(20 * mm, height - 70 * mm, "件名：システム構築費")

    # Sender (Right aligned manually)
    c.setFont(font_name, 12)
    sender_x = width - 60 * mm
    c.drawString(sender_x, height - 60 * mm, "西村 友祐")
    
    # Invoice Date
    transfer_date = datetime.datetime.strptime(date_str, "%Y/%m/%d")
    invoice_date = transfer_date - relativedelta(months=1)
    invoice_date_str = invoice_date.strftime("%Y年%m月%d日")
    c.drawString(sender_x, height - 70 * mm, f"請求日：{invoice_date_str}")

    # Spacer
    
    # Grand Total
    c.setLineWidth(1)
    c.setFont(font_name, 14)
    c.drawString(width / 2 - 40*mm, height - 100 * mm, "ご請求金額")
    c.setFont(font_name, 24)
    c.drawString(width / 2 + 10*mm, height - 100 * mm, f"¥ {amount_str} -")
    # Underline
    c.line(width / 2 + 5*mm, height - 102 * mm, width / 2 + 70*mm, height - 102 * mm)

    # Table Header
    y_start = height - 130 * mm
    c.setFont(font_name, 12)
    c.rect(20*mm, y_start, 170*mm, 10*mm, fill=0) # Border
    c.drawString(30*mm, y_start + 3*mm, "品目")
    c.drawString(90*mm, y_start + 3*mm, "数量")
    c.drawString(110*mm, y_start + 3*mm, "単価")
    c.drawString(150*mm, y_start + 3*mm, "金額")

    # Table Content
    y_row = y_start - 10*mm
    c.rect(20*mm, y_row, 170*mm, 10*mm, fill=0)
    c.drawString(30*mm, y_row + 3*mm, "システム構築費")
    c.drawString(95*mm, y_row + 3*mm, "1")
    c.drawString(110*mm, y_row + 3*mm, f"¥ {amount_str}")
    c.drawString(150*mm, y_row + 3*mm, f"¥ {amount_str}")

    # Empty rows
    for i in range(3):
        y_row -= 10*mm
        c.rect(20*mm, y_row, 170*mm, 10*mm, fill=0)

    # Bank Info
    y_bank = y_row - 20*mm
    c.setFont(font_name, 14)
    c.drawString(20*mm, y_bank, "お振込先")
    
    c.setFont(font_name, 11)
    y_bank -= 8*mm
    c.drawString(25*mm, y_bank, "ゆうちょ銀行")
    y_bank -= 6*mm
    c.drawString(25*mm, y_bank, "六四八（ロクヨンハチ）店 (648)")
    y_bank -= 6*mm
    c.drawString(25*mm, y_bank, "普通　1050996")
    y_bank -= 6*mm
    c.drawString(25*mm, y_bank, "記号番号：16440　口座番号：10509961")
    y_bank -= 6*mm
    c.drawString(25*mm, y_bank, "名義：ニシムラ ユウスケ")

    # Notes
    y_note = y_bank - 15*mm
    c.setFont(font_name, 9)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.drawString(20*mm, y_note, "※ 振込手数料は貴社負担にてお願いいたします。")

    c.save()
    print(f"Generated PDF: {output_filename}")

if __name__ == "__main__":
    transactions = [
        ("2025/02/03", "300,000"),
        ("2025/04/25", "200,000"),
        ("2025/05/01", "260,000"),
        ("2025/05/21", "250,000"),
        ("2025/06/24", "250,000"),
        ("2025/07/25", "230,000"),
        ("2025/08/25", "200,000"),
        ("2025/11/26", "270,000"),
        ("2025/12/29", "150,000"),
    ]

    target_dir = "/Users/yuyu24/Downloads/個人事業請求書"
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    for date_str, amount in transactions:
        dt = datetime.datetime.strptime(date_str, "%Y/%m/%d")
        fname = f"請求書_{dt.strftime('%Y%m%d')}_{amount.replace(',', '')}.pdf"
        output_path = os.path.join(target_dir, fname)
        create_pdf_invoice(date_str, amount, output_path)
