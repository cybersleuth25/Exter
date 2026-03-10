"""
Analysis routes — trigger AI analysis, retrieve results.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from database.mongodb import get_db
from models.project_model import AnalysisResponse, JudgeQuestions
from routes.auth_routes import get_current_user
from services.ai_engine import (
    generate_project_summary,
    analyze_strengths,
    analyze_weaknesses,
    generate_judge_questions,
    generate_improvements,
    generate_scores,
    JUDGE_PERSONAS,
)
from services.scoring_engine import compute_final_score

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


def _analysis_to_response(doc: dict) -> AnalysisResponse:
    return AnalysisResponse(
        id=str(doc["_id"]),
        project_id=doc["project_id"],
        summary=doc["summary"],
        strengths=doc["strengths"],
        weaknesses=doc["weaknesses"],
        scores=doc["scores"],
        judge_questions=doc["judge_questions"],
        suggestions=doc["suggestions"],
        created_at=doc["created_at"],
    )


@router.post("/analyze/{project_id}", response_model=AnalysisResponse)
async def analyze_project(project_id: str, user=Depends(get_current_user)):
    db = get_db()

    # Verify project belongs to user
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": str(user["_id"]),
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_data = {
        "title": project["title"],
        "problem_statement": project["problem_statement"],
        "description": project["description"],
        "tech_stack": project["tech_stack"],
        "target_users": project["target_users"],
        "business_model": project.get("business_model", ""),
    }

    # Run all AI analyses
    summary = await generate_project_summary(project_data)
    strengths = await analyze_strengths(project_data)
    weaknesses = await analyze_weaknesses(project_data)
    raw_scores = await generate_scores(project_data)
    scores = compute_final_score(raw_scores)
    suggestions = await generate_improvements(project_data, weaknesses)

    # Generate questions from all judges
    judge_questions = []
    for judge_key, persona in JUDGE_PERSONAS.items():
        questions = await generate_judge_questions(project_data, judge_key)
        judge_questions.append({
            "judge_type": judge_key,
            "judge_name": persona["name"],
            "questions": questions,
        })

    # Store analysis
    analysis_doc = {
        "project_id": project_id,
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "scores": scores.model_dump(),
        "judge_questions": judge_questions,
        "suggestions": suggestions,
        "created_at": datetime.utcnow(),
    }

    # Upsert — replace existing analysis for this project
    existing = await db.analyses.find_one({"project_id": project_id})
    if existing:
        await db.analyses.replace_one({"_id": existing["_id"]}, analysis_doc)
        analysis_doc["_id"] = existing["_id"]
    else:
        result = await db.analyses.insert_one(analysis_doc)
        analysis_doc["_id"] = result.inserted_id

    return _analysis_to_response(analysis_doc)


@router.get("/{project_id}", response_model=AnalysisResponse)
async def get_analysis(project_id: str, user=Depends(get_current_user)):
    db = get_db()

    # Verify project belongs to user
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": str(user["_id"]),
    })
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = await db.analyses.find_one({"project_id": project_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found. Run analysis first.")

    return _analysis_to_response(analysis)
