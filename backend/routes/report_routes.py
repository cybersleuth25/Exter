"""
Report download route — generates PDF on the fly.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from bson import ObjectId
import io

from database.mongodb import get_db
from routes.auth_routes import get_current_user
from services.pdf_generator import generate_report_pdf

router = APIRouter(prefix="/api/report", tags=["Report"])


@router.get("/{project_id}")
async def download_report(project_id: str, user=Depends(get_current_user)):
    db = get_db()

    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": str(user["_id"]),
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = await db.analyses.find_one({"project_id": project_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")

    # Fetch all viva sessions for this project
    sessions = []
    cursor = db.sessions.find({"project_id": project_id})
    async for sess in cursor:
        sessions.append(sess)

    project_dict = {
        "title": project["title"],
        "description": project["description"],
    }

    pdf_bytes = generate_report_pdf(project_dict, analysis, sessions)

    safe_title = project["title"].replace(" ", "_")[:30]
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="report_{safe_title}.pdf"'
        },
    )
