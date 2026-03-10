"""
Project CRUD routes.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from database.mongodb import get_db
from models.project_model import ProjectCreate, ProjectResponse
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def _project_to_response(doc: dict, has_analysis: bool = False) -> ProjectResponse:
    return ProjectResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        title=doc["title"],
        problem_statement=doc["problem_statement"],
        description=doc["description"],
        tech_stack=doc["tech_stack"],
        target_users=doc["target_users"],
        business_model=doc.get("business_model"),
        github_link=doc.get("github_link"),
        created_at=doc["created_at"],
        has_analysis=has_analysis,
    )


@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(project: ProjectCreate, user=Depends(get_current_user)):
    db = get_db()
    doc = {
        "user_id": str(user["_id"]),
        "title": project.title,
        "problem_statement": project.problem_statement,
        "description": project.description,
        "tech_stack": project.tech_stack,
        "target_users": project.target_users,
        "business_model": project.business_model,
        "github_link": project.github_link,
        "created_at": datetime.utcnow(),
    }
    result = await db.projects.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _project_to_response(doc)


@router.get("/", response_model=list[ProjectResponse])
async def list_projects(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.projects.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    projects = []
    async for doc in cursor:
        analysis = await db.analyses.find_one({"project_id": str(doc["_id"])})
        projects.append(_project_to_response(doc, has_analysis=analysis is not None))
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user=Depends(get_current_user)):
    db = get_db()
    doc = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": str(user["_id"]),
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    analysis = await db.analyses.find_one({"project_id": project_id})
    return _project_to_response(doc, has_analysis=analysis is not None)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, user=Depends(get_current_user)):
    db = get_db()
    result = await db.projects.delete_one({
        "_id": ObjectId(project_id),
        "user_id": str(user["_id"]),
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    # Cascade delete related data
    await db.analyses.delete_many({"project_id": project_id})
    await db.sessions.delete_many({"project_id": project_id})
