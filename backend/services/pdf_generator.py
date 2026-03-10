"""
PDF Report Generator using ReportLab.
"""
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY


# ── Color Palette ────────────────────────────────────────
PRIMARY = HexColor("#6C5CE7")
DARK = HexColor("#2D3436")
LIGHT_BG = HexColor("#F8F9FA")
SUCCESS = HexColor("#00B894")
WARNING = HexColor("#FDCB6E")
DANGER = HexColor("#E17055")
WHITE = HexColor("#FFFFFF")


def _build_styles():
    """Create custom styles for the PDF."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="ReportTitle",
        parent=styles["Title"],
        fontSize=26,
        textColor=PRIMARY,
        spaceAfter=6,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        name="ReportSubtitle",
        parent=styles["Normal"],
        fontSize=12,
        textColor=DARK,
        alignment=TA_CENTER,
        spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        name="SectionHead",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=PRIMARY,
        spaceBefore=18,
        spaceAfter=8,
        borderPadding=4,
    ))
    styles.add(ParagraphStyle(
        name="BodyText2",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name="BulletItem",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=DARK,
        leftIndent=20,
        bulletIndent=8,
        spaceAfter=4,
    ))
    return styles


def generate_report_pdf(
    project: dict,
    analysis: dict,
    sessions: list[dict] | None = None,
) -> bytes:
    """Generate a structured PDF report and return raw bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=25 * mm,
        bottomMargin=25 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )
    styles = _build_styles()
    story = []

    # ── Title Page ───────────────────────────────────────
    story.append(Spacer(1, 60))
    story.append(Paragraph("ProjectDefense AI", styles["ReportTitle"]))
    story.append(Paragraph("Evaluation Report", styles["ReportSubtitle"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        f"<b>{project.get('title', 'Untitled Project')}</b>",
        ParagraphStyle("ProjectName", parent=styles["Title"], fontSize=20,
                       textColor=DARK, alignment=TA_CENTER),
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}",
        styles["ReportSubtitle"],
    ))
    story.append(HRFlowable(width="80%", thickness=1, color=PRIMARY, spaceAfter=20))

    # ── Summary ──────────────────────────────────────────
    story.append(Paragraph("Project Summary", styles["SectionHead"]))
    story.append(Paragraph(analysis.get("summary", "No summary available."), styles["BodyText2"]))

    # ── Strengths ────────────────────────────────────────
    story.append(Paragraph("Strengths", styles["SectionHead"]))
    for s in analysis.get("strengths", []):
        story.append(Paragraph(f"\u2022 {s}", styles["BulletItem"]))

    # ── Weaknesses ───────────────────────────────────────
    story.append(Paragraph("Weaknesses", styles["SectionHead"]))
    for w in analysis.get("weaknesses", []):
        story.append(Paragraph(f"\u2022 {w}", styles["BulletItem"]))

    # ── Scorecard ────────────────────────────────────────
    story.append(Paragraph("Scorecard", styles["SectionHead"]))
    scores = analysis.get("scores", {})
    score_data = [["Category", "Score"]]
    for key in ["technical_complexity", "innovation", "scalability",
                "business_potential", "implementation_clarity", "overall"]:
        label = key.replace("_", " ").title()
        val = scores.get(key, "N/A")
        score_data.append([label, f"{val} / 10"])

    score_table = Table(score_data, colWidths=[280, 100])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#DFE6E9")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(score_table)

    # ── Judge Questions ──────────────────────────────────
    judge_questions = analysis.get("judge_questions", [])
    if judge_questions:
        story.append(PageBreak())
        story.append(Paragraph("Judge Questions", styles["SectionHead"]))
        for jq in judge_questions:
            story.append(Paragraph(
                f"<b>{jq.get('judge_name', 'Judge')}</b>",
                styles["BodyText2"],
            ))
            for i, q in enumerate(jq.get("questions", []), 1):
                story.append(Paragraph(f"  {i}. {q}", styles["BulletItem"]))
            story.append(Spacer(1, 8))

    # ── Viva Sessions ────────────────────────────────────
    if sessions:
        story.append(Paragraph("Viva Session Results", styles["SectionHead"]))
        for sess in sessions:
            story.append(Paragraph(
                f"<b>Judge: {sess.get('judge_type', '').title()}</b> — "
                f"Score: {sess.get('final_score', 'N/A')}/10",
                styles["BodyText2"],
            ))
            for qa in sess.get("questions", []):
                story.append(Paragraph(f"<b>Q:</b> {qa.get('question', '')}", styles["BulletItem"]))
                if qa.get("answer"):
                    story.append(Paragraph(f"<b>A:</b> {qa['answer']}", styles["BulletItem"]))
                if qa.get("evaluation"):
                    story.append(Paragraph(f"<i>Eval:</i> {qa['evaluation']}", styles["BulletItem"]))
            story.append(Spacer(1, 10))

    # ── Improvement Suggestions ──────────────────────────
    story.append(Paragraph("Improvement Suggestions", styles["SectionHead"]))
    for s in analysis.get("suggestions", []):
        story.append(Paragraph(f"\u2022 {s}", styles["BulletItem"]))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.read()
