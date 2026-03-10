"""
Scoring Engine — normalizes and computes final scores.
"""
from models.project_model import ScoreBreakdown


def compute_final_score(raw_scores: dict) -> ScoreBreakdown:
    """Normalize raw AI scores into a ScoreBreakdown."""
    categories = [
        "technical_complexity",
        "innovation",
        "scalability",
        "business_potential",
        "implementation_clarity",
    ]

    normalized = {}
    for cat in categories:
        val = raw_scores.get(cat, 5.0)
        normalized[cat] = round(min(max(float(val), 0), 10), 1)

    overall = round(sum(normalized.values()) / len(normalized), 1)
    normalized["overall"] = overall

    return ScoreBreakdown(**normalized)


def compute_viva_score(qa_pairs: list[dict]) -> float:
    """Compute average viva session score from Q&A evaluations."""
    scores = [qa.get("score", 0) for qa in qa_pairs if qa.get("score") is not None]
    if not scores:
        return 0.0
    return round(sum(scores) / len(scores), 1)
