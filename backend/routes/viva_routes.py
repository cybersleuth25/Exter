"""
Viva Simulator routes — session management, Q&A, evaluation.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from database.mongodb import get_db
from models.project_model import SessionCreate, AnswerSubmit, SessionResponse, QAPair
from routes.auth_routes import get_current_user
from services.ai_engine import generate_judge_questions, evaluate_answer
from services.scoring_engine import compute_viva_score

router = APIRouter(prefix="/api/viva", tags=["Viva Simulator"])


def _session_to_response(doc: dict) -> SessionResponse:
    return SessionResponse(
        id=str(doc["_id"]),
        project_id=doc["project_id"],
        judge_type=doc["judge_type"],
        questions=[QAPair(**qa) for qa in doc["questions"]],
        current_question_index=doc.get("current_question_index", 0),
        is_completed=doc.get("is_completed", False),
        final_score=doc.get("final_score"),
        created_at=doc["created_at"],
    )


@router.post("/start", response_model=SessionResponse, status_code=201)
async def start_viva_session(session_data: SessionCreate, user=Depends(get_current_user)):
    db = get_db()

    project = await db.projects.find_one({
        "_id": ObjectId(session_data.project_id),
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

    questions = await generate_judge_questions(project_data, session_data.judge_type)

    session_doc = {
        "project_id": session_data.project_id,
        "user_id": str(user["_id"]),
        "judge_type": session_data.judge_type,
        "questions": [{"question": q, "answer": None, "evaluation": None, "score": None} for q in questions],
        "current_question_index": 0,
        "is_completed": False,
        "final_score": None,
        "created_at": datetime.utcnow(),
    }

    result = await db.sessions.insert_one(session_doc)
    session_doc["_id"] = result.inserted_id
    return _session_to_response(session_doc)


@router.post("/answer", response_model=SessionResponse)
async def submit_answer(answer_data: AnswerSubmit, user=Depends(get_current_user)):
    db = get_db()

    session = await db.sessions.find_one({"_id": ObjectId(answer_data.session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("is_completed"):
        raise HTTPException(status_code=400, detail="Session already completed")

    idx = answer_data.question_index
    if idx < 0 or idx >= len(session["questions"]):
        raise HTTPException(status_code=400, detail="Invalid question index")

    # Get project for context
    project = await db.projects.find_one({"_id": ObjectId(session["project_id"])})
    project_data = {
        "title": project["title"],
        "description": project["description"],
    }

    question_text = session["questions"][idx]["question"]

    # Evaluate answer via AI
    eval_result = await evaluate_answer(
        project_data, session["judge_type"], question_text, answer_data.answer
    )

    # Update session
    session["questions"][idx]["answer"] = answer_data.answer
    session["questions"][idx]["evaluation"] = eval_result.get("evaluation", "")
    session["questions"][idx]["score"] = float(eval_result.get("score", 5.0))

    # Advance to next question
    next_index = idx + 1
    is_completed = next_index >= len(session["questions"])

    update_fields = {
        "questions": session["questions"],
        "current_question_index": next_index,
        "is_completed": is_completed,
    }

    if is_completed:
        update_fields["final_score"] = compute_viva_score(session["questions"])

    await db.sessions.update_one(
        {"_id": session["_id"]},
        {"$set": update_fields},
    )

    session.update(update_fields)
    return _session_to_response(session)


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, user=Depends(get_current_user)):
    db = get_db()
    session = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return _session_to_response(session)


@router.get("/history/{project_id}", response_model=list[SessionResponse])
async def get_session_history(project_id: str, user=Depends(get_current_user)):
    db = get_db()
    cursor = db.sessions.find({"project_id": project_id}).sort("created_at", -1)
    sessions = []
    async for doc in cursor:
        sessions.append(_session_to_response(doc))
    return sessions
