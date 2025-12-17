import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"1. Checking Key Format: {api_key[:5]}... (Length: {len(api_key)})")

if not api_key:
    print("!!! ERROR: API Key is empty. Check .env file.")
    exit()

try:
    genai.configure(api_key=api_key)
    
    # CHANGED: Using 'gemini-pro' because your library version is older
    print("2. Connecting to Google AI (Model: gemini-pro)...")
    model = genai.GenerativeModel('gemini-pro')
    
    response = model.generate_content("Hello, are you ready for the Viva?")
    
    print("\nSUCCESS! The AI replied:")
    print(response.text)

except Exception as e:
    print(f"\n!!! CONNECTION FAILED: {e}")