import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Searching for available models...")

try:
    # Ask Google: "What models can I use?"
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- Found Model: {m.name}")
            
except Exception as e:
    print(f"Error: {e}")