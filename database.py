from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class VivaSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100))
    github_link = db.Column(db.String(200))
    # We store the full context (Code + Report) to verify logic later
    context_data = db.Column(db.Text) 
    # JSON string of the chat history
    chat_history = db.Column(db.Text, default="[]") 
    final_score = db.Column(db.String(50))