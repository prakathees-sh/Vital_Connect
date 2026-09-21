import io
import qrcode
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

def create_qr_image_stream(qr_text: str) -> io.BytesIO:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(qr_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#DC2626", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer

def generate_donation_certificate_pdf(cert_data: Dict[str, Any]) -> io.BytesIO:
    """Generates official Vital Connect Certificate of Blood Donation PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CertTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#DC2626"),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        "CertSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#475569"),
        alignment=1
    )
    donor_style = ParagraphStyle(
        "CertDonor",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0F172A"),
        alignment=1
    )
    body_style = ParagraphStyle(
        "CertBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#334155"),
        alignment=1
    )
    disclaimer_style = ParagraphStyle(
        "CertDisclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94A3B8"),
        alignment=1
    )

    story = []

    # Header
    story.append(Paragraph("🩸 VITAL CONNECT", title_style))
    story.append(Paragraph("Emergency Blood Coordination Platform", subtitle_style))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#DC2626"), spaceAfter=20))

    story.append(Paragraph("CERTIFICATE OF BLOOD DONATION", ParagraphStyle(
        "AwardText", fontName="Helvetica-Bold", fontSize=16, leading=20, alignment=1, textColor=colors.HexColor("#B91C1C")
    )))
    story.append(Spacer(1, 15))

    story.append(Paragraph("This certificate is honorably presented in grateful recognition of", body_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(cert_data.get("donor_name", "Honored Donor"), donor_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("for generously answering the call of emergency and donating life-saving blood.", body_style))
    story.append(Spacer(1, 20))

    # Details Table
    table_data = [
        [
            Paragraph("<b>Certificate ID:</b>", styles["Normal"]),
            Paragraph(cert_data.get("certificate_code", "VC-CERT-00000"), styles["Normal"]),
            Paragraph("<b>Blood Group:</b>", styles["Normal"]),
            Paragraph(f"<font color='#DC2626'><b>{cert_data.get('blood_group', 'N/A')}</b></font>", styles["Normal"])
        ],
        [
            Paragraph("<b>Donation Date:</b>", styles["Normal"]),
            Paragraph(cert_data.get("donation_date", "Recent"), styles["Normal"]),
            Paragraph("<b>District / Region:</b>", styles["Normal"]),
            Paragraph(cert_data.get("district", "Tamil Nadu"), styles["Normal"])
        ],
        [
            Paragraph("<b>Healthcare Facility:</b>", styles["Normal"]),
            Paragraph(cert_data.get("facility_name", "Partner Blood Center"), styles["Normal"]),
            Paragraph("<b>Status:</b>", styles["Normal"]),
            Paragraph("<font color='#059669'><b>Verified Donation</b></font>", styles["Normal"])
        ]
    ]

    t = Table(table_data, colWidths=[120, 140, 100, 140])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 25))

    # Verification QR Code & Note
    verify_url = cert_data.get("verification_url", "https://vitalconnect.org/verify")
    qr_stream = create_qr_image_stream(verify_url)
    qr_img = Image(qr_stream, width=1.4 * inch, height=1.4 * inch)

    qr_table = Table([
        [
            qr_img,
            Paragraph(
                f"<b>Digital Verification:</b><br/>"
                f"Scan this secure QR code or visit:<br/>"
                f"<font color='#2563EB'>{verify_url}</font><br/><br/>"
                f"<i>This credential is cryptographic record of donor participation.</i>",
                body_style
            )
        ]
    ], colWidths=[120, 380])
    qr_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (0, 0), 'CENTER'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(qr_table)

    story.append(Spacer(1, 30))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=15))
    story.append(Paragraph(
        "IMPORTANT NOTICE: This certificate is an honorary token of voluntary blood coordination. "
        "It is NOT a medical diagnosis, clinical clearance, or health guarantee. "
        "Vital Connect facilitates rapid emergency discovery between certified facilities and donors.",
        disclaimer_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer

def generate_inventory_report_pdf(inventory_items: List[Dict[str, Any]], admin_name: str = "Admin") -> io.BytesIO:
    """Generates official Blood Bank Inventory Report PDF for administrators."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    story = [
        Paragraph("🩸 VITAL CONNECT — Blood Inventory Status Report", ParagraphStyle(
            "Head", fontName="Helvetica-Bold", fontSize=18, textColor=colors.HexColor("#DC2626")
        )),
        Paragraph(f"Generated at: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')} | Auditor: {admin_name}", styles["Normal"]),
        Spacer(1, 15),
    ]

    header_row = ["Facility / Blood Bank", "District", "Blood Group", "Units", "Status"]
    table_rows = [header_row]

    for item in inventory_items:
        table_rows.append([
            item.get("bank_name", "N/A"),
            item.get("district", "N/A"),
            item.get("blood_group", "N/A"),
            str(item.get("units_available", 0)),
            item.get("status", "Sufficient")
        ])

    t = Table(table_rows, colWidths=[150, 110, 80, 80, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#DC2626")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)
    return buffer
