from flask import Flask, render_template, request, jsonify, redirect, url_for
from database import db, VivaSession
from core.ingestion import extract_pdf_text, fetch_github_code
from core.ai_engine import get_examiner_question, generate_score_report
import os
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///viva.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/setup', methods=['POST'])
def setup():
    # 1. Get Data
    if 'pdf_file' not in request.files:
        return "No file uploaded", 400
    
    pdf = request.files['pdf_file']
    github_url = request.form['github_url']
    student_name = request.form['student_name']
    
    # 2. Process Data
    report_text = extract_pdf_text(pdf)
    code_text = fetch_github_code(github_url)
    full_context = f"REPORT:\n{report_text}\n\nCODE:\n{code_text}"
    
    # 3. Save Session
    new_session = VivaSession(
        student_name=student_name,
        github_link=github_url,
        context_data=full_context,
        chat_history=json.dumps([]) 
    )
    db.session.add(new_session)
    db.session.commit()
    
    return redirect(url_for('viva_room', session_id=new_session.id))

@app.route('/viva/<int:session_id>')
def viva_room(session_id):
    session = VivaSession.query.get_or_404(session_id)
    return render_template('viva.html', session=session)

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.json
    session = VivaSession.query.get(data['session_id'])
    history = json.loads(session.chat_history)
    
    # User's turn
    if data.get('answer'):
        history.append({"role": "user", "parts": [data['answer']]})
    
    # AI's turn
    ai_response = get_examiner_question(session.context_data, history)
    history.append({"role": "model", "parts": [ai_response]})
    
    # Update DB
    session.chat_history = json.dumps(history)
    db.session.commit()
    
    return jsonify({"response": ai_response})

@app.route('/finish/<int:session_id>')
def finish_viva(session_id):
    session = VivaSession.query.get(session_id)
    history = json.loads(session.chat_history)
    
    # Generate Report
    report_data = generate_score_report(str(history))
    
    return render_template('report.html', report=report_data, student=session.student_name)

if __name__ == '__main__':
    app.run(debug=True)