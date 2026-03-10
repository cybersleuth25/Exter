"""
Pydantic models for Projects, Analyses, Sessions, and Scores.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Project ──────────────────────────────────────────────
class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    problem_statement: str = Field(..., min_length=10)
    description: str = Field(..., min_length=20)
    tech_stack: List[str] = Field(..., min_length=1)
    target_users: str
    business_model: Optional[str] = None
    github_link: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    user_id: str
    title: str
    problem_statement: str
    description: str
    tech_stack: List[str]
    target_users: str
    business_model: Optional[str] = None
    github_link: Optional[str] = None
    created_at: datetime
    has_analysis: bool = False


# ── Analysis ─────────────────────────────────────────────
class ScoreBreakdown(BaseModel):
    technical_complexity: float = 0
    innovation: float = 0
    scalability: float = 0
    business_potential: float = 0
    implementation_clarity: float = 0
    overall: float = 0


class JudgeQuestions(BaseModel):
    judge_type: str
    judge_name: str
    questions: List[str]


class AnalysisResponse(BaseModel):
    id: str
    project_id: str
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    scores: ScoreBreakdown
    judge_questions: List[JudgeQuestions]
    suggestions: List[str]
    created_at: datetime


# ── Viva Session ─────────────────────────────────────────
class SessionCreate(BaseModel):
    project_id: str
    judge_type: str = Field(..., pattern="^(technical|investor|academic|product)$")


class AnswerSubmit(BaseModel):
    session_id: str
    question_index: int
    answer: str


class QAPair(BaseModel):
    question: str
    answer: Optional[str] = None
    evaluation: Optional[str] = None
    score: Optional[float] = None


class SessionResponse(BaseModel):
    id: str
    project_id: str
    judge_type: str
    questions: List[QAPair]
    current_question_index: int = 0
    is_completed: bool = False
    final_score: Optional[float] = None
    created_at: datetime
