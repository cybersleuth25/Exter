"""
AI Engine — interfaces with Google Gemini to generate all AI-driven content.
"""
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

model = genai.GenerativeModel("gemini-1.5-flash")

# ── Judge Personality Prompts ────────────────────────────
JUDGE_PERSONAS = {
    "technical": {
        "name": "Dr. Technica — Technical Judge",
        "system": (
            "You are Dr. Technica, a senior software architect and technical judge. "
            "You focus on system design, scalability, architecture patterns, code quality, "
            "security, and technical feasibility. You are rigorous but fair. "
            "Ask questions that probe the depth of technical understanding."
        ),
    },
    "investor": {
        "name": "Mr. Capital — Startup Investor",
        "system": (
            "You are Mr. Capital, a seasoned venture capital investor who has funded 200+ startups. "
            "You focus on business model viability, market size (TAM/SAM/SOM), revenue potential, "
            "unit economics, competitive moat, and go-to-market strategy. "
            "Ask questions that test business acumen and market understanding."
        ),
    },
    "academic": {
        "name": "Prof. Scholar — Academic Examiner",
        "system": (
            "You are Prof. Scholar, a university professor conducting a viva voce examination. "
            "You focus on algorithmic correctness, implementation details, data structures, "
            "computational complexity, research methodology, and theoretical understanding. "
            "Ask questions that test deep conceptual knowledge."
        ),
    },
    "product": {
        "name": "Ms. UX — Product Judge",
        "system": (
            "You are Ms. UX, a product design lead from a top tech company. "
            "You focus on user experience, product-market fit, user journey, accessibility, "
            "design thinking process, and product strategy. "
            "Ask questions about how the product serves its users."
        ),
    },
}


async def generate_project_summary(project_data: dict) -> str:
    """Generate a concise project summary."""
    prompt = f"""Analyze the following project and generate a concise 3-5 sentence summary
that captures the core idea, target audience, and value proposition.

Project Title: {project_data.get('title', '')}
Problem Statement: {project_data.get('problem_statement', '')}
Description: {project_data.get('description', '')}
Tech Stack: {', '.join(project_data.get('tech_stack', []))}
Target Users: {project_data.get('target_users', '')}
Business Model: {project_data.get('business_model', 'Not specified')}

Return ONLY the summary text, no formatting, no headers."""

    response = await model.generate_content_async(prompt)
    return response.text.strip()


async def analyze_strengths(project_data: dict) -> list[str]:
    """Identify project strengths."""
    prompt = f"""Analyze this project and identify 4-6 key strengths.
Consider: innovation, technical approach, market fit, implementation quality, team capability.

Project Title: {project_data.get('title', '')}
Problem Statement: {project_data.get('problem_statement', '')}
Description: {project_data.get('description', '')}
Tech Stack: {', '.join(project_data.get('tech_stack', []))}
Target Users: {project_data.get('target_users', '')}
Business Model: {project_data.get('business_model', 'Not specified')}

Return a JSON array of strings. Example: ["Strength 1", "Strength 2"]
Return ONLY valid JSON, nothing else."""

    response = await model.generate_content_async(prompt)
    try:
        return json.loads(response.text.strip().strip("```json").strip("```"))
    except json.JSONDecodeError:
        return [line.strip("- ").strip() for line in response.text.strip().split("\n") if line.strip()]


async def analyze_weaknesses(project_data: dict) -> list[str]:
    """Detect project weaknesses and gaps."""
    prompt = f"""Analyze this project and identify 4-6 weaknesses, gaps, or risks.
Consider: missing components, unclear architecture, weak business model, scalability risks,
security concerns, market competition, unclear user value.

Project Title: {project_data.get('title', '')}
Problem Statement: {project_data.get('problem_statement', '')}
Description: {project_data.get('description', '')}
Tech Stack: {', '.join(project_data.get('tech_stack', []))}
Target Users: {project_data.get('target_users', '')}
Business Model: {project_data.get('business_model', 'Not specified')}

Return a JSON array of strings. Example: ["Weakness 1", "Weakness 2"]
Return ONLY valid JSON, nothing else."""

    response = await model.generate_content_async(prompt)
    try:
        return json.loads(response.text.strip().strip("```json").strip("```"))
    except json.JSONDecodeError:
        return [line.strip("- ").strip() for line in response.text.strip().split("\n") if line.strip()]


async def generate_judge_questions(project_data: dict, judge_type: str) -> list[str]:
    """Generate 5-8 judge questions based on the judge personality."""
    persona = JUDGE_PERSONAS.get(judge_type, JUDGE_PERSONAS["technical"])

    prompt = f"""{persona['system']}

Based on the following project, generate 5-8 challenging but fair questions that you would
ask during a defense/evaluation. Questions should be specific to this project, not generic.

Project Title: {project_data.get('title', '')}
Problem Statement: {project_data.get('problem_statement', '')}
Description: {project_data.get('description', '')}
Tech Stack: {', '.join(project_data.get('tech_stack', []))}
Target Users: {project_data.get('target_users', '')}
Business Model: {project_data.get('business_model', 'Not specified')}

Return a JSON array of question strings.
Return ONLY valid JSON, nothing else."""

    response = await model.generate_content_async(prompt)
    try:
        return json.loads(response.text.strip().strip("```json").strip("```"))
    except json.JSONDecodeError:
        return [line.strip("- ").strip() for line in response.text.strip().split("\n") if line.strip()]


async def evaluate_answer(project_data: dict, judge_type: str, question: str, answer: str) -> dict:
    """Evaluate a student's answer to a viva question."""
    persona = JUDGE_PERSONAS.get(judge_type, JUDGE_PERSONAS["technical"])

    prompt = f"""{persona['system']}

You asked the following question about a project:
Question: {question}

The student answered:
Answer: {answer}

Project context:
Title: {project_data.get('title', '')}
Description: {project_data.get('description', '')}

Evaluate this answer. Return a JSON object with:
- "evaluation": a 2-3 sentence assessment of the answer quality
- "score": a score from 0 to 10

Return ONLY valid JSON, nothing else."""

    response = await model.generate_content_async(prompt)
    try:
        return json.loads(response.text.strip().strip("```json").strip("```"))
    except json.JSONDecodeError:
        return {"evaluation": response.text.strip(), "score": 5.0}


async def generate_improvements(project_data: dict, weaknesses: list[str]) -> list[str]:
    """Generate improvement suggestions."""
    prompt = f"""Based on the following project and its identified weaknesses,
generate 5-8 specific, actionable improvement recommendations.

Project Title: {project_data.get('title', '')}
Description: {project_data.get('description', '')}
Tech Stack: {', '.join(project_data.get('tech_stack', []))}
Business Model: {project_data.get('business_model', 'Not specified')}

Identified Weaknesses:
{json.dumps(weaknesses, indent=2)}

Cover improvements for: architecture, features, business model, technical implementation.

Return a JSON array of recommendation strings.
Return ONLY valid JSON, nothing else."""

    response = await model.generate_content_async(prompt)
    try:
        return json.loads(response.text.strip().strip("```json").strip("```"))
    except json.JSONDecodeError:
        return [line.strip("- ").strip() for line in response.text.strip().split("\n") if line.strip()]


async def generate_scores(project_data: dict) -> dict:
    """Score the project across multiple categories."""
    prompt = f"""Score the following project across these categories on a scale of 0-10.
Be fair and realistic in your assessment.

Project Title: {project_data.get('title', '')}
Problem Statement: {project_data.get('problem_statement', '')}
Description: {project_data.get('description', '')}
Tech Stack: {', '.join(project_data.get('tech_stack', []))}
Target Users: {project_data.get('target_users', '')}
Business Model: {project_data.get('business_model', 'Not specified')}

Categories:
- technical_complexity: How technically challenging is the project?
- innovation: How novel or creative is the approach?
- scalability: Can this scale to many users/markets?
- business_potential: Is there a viable business opportunity?
- implementation_clarity: How clear and well-structured is the implementation plan?

Return a JSON object with each category as a key and a float score (0-10) as value.
Also include an "overall" key that is the average of all scores.
Return ONLY valid JSON, nothing else."""

    response = await model.generate_content_async(prompt)
    try:
        scores = json.loads(response.text.strip().strip("```json").strip("```"))
        if "overall" not in scores:
            vals = [v for k, v in scores.items() if k != "overall"]
            scores["overall"] = round(sum(vals) / len(vals), 1) if vals else 0
        return scores
    except json.JSONDecodeError:
        return {
            "technical_complexity": 5.0,
            "innovation": 5.0,
            "scalability": 5.0,
            "business_potential": 5.0,
            "implementation_clarity": 5.0,
            "overall": 5.0,
        }
