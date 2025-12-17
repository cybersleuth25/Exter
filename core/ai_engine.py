import google.generativeai as genai
import os
import json
import time
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# FIX: Switch to the standard stable model (Safe for Free Tier)
# This model was in your "check_models.py" list!
model = genai.GenerativeModel('gemini-flash-latest')

def get_examiner_question(context, history):
    try:
        # SAFETY CUTOFF: If context is too massive, trim it to first 15,000 chars
        # This prevents "Token Limit" errors on free accounts.
        if len(context) > 15000:
            context = context[:15000] + "\n...[TRUNCATED FOR SPEED]..."

        system_prompt = """
        You are a strict External Examiner for a CS Engineering Viva.
        1. The user has provided their Project Report and Code.
        2. Ask ONE short, technical question to verify they wrote the code.
        3. Be skeptical. If the code is inefficient, point it out.
        4. Do NOT answer the question yourself. Just ask.
        """
        
        full_prompt = f"{system_prompt}\n\nPROJECT CONTEXT:\n{context}\n\n"
        
        chat = model.start_chat(history=history)
        response = chat.send_message(full_prompt + "Ask the next question.")
        return response.text

    except Exception as e:
        error_msg = str(e)
        print(f"!!! GEMINI ERROR: {error_msg}")
        
        if "429" in error_msg:
            return "I am overloaded (Rate Limit Reached). Please wait 30 seconds and try again."
        else:
            return f"System Error: {error_msg}"

def generate_score_report(chat_history):
    try:
        prompt = f"""
        Analyze this viva session: {chat_history}
        
        Return a valid JSON object with these exact keys:
        {{
            "score": "Integer out of 10",
            "feedback": "A short paragraph on their performance",
            "weak_areas": ["List of 3 technical concepts they struggled with"]
        }}
        Do not add markdown formatting like ```json. Just raw JSON.
        """
        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except Exception as e:
        print(f"!!! REPORT ERROR: {e}")
        return {"score": 0, "feedback": "Error generating report", "weak_areas": []}