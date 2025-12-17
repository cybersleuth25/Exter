# The Extern — Mini MVP

Run locally:

1. python -m venv venv
2. source venv/bin/activate    # or venv\Scripts\activate on Windows
3. pip install -r requirements.txt
4. cp .env.example .env
5. (optional) set LLM_API_KEY in .env to call real LLM (not required for initial dev)
6. python app.py
7. Open http://127.0.0.1:5000/

Notes:
- The backend uses a local stub LLM by default (safe, free). Replace call_llm_api_stub with call_llm_api_real and set LLM_API_KEY to enable a real model.
- This prototype demonstrates the full pipeline: PDF -> GitHub -> LLM -> JSON results.
