from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import spacy
import pandas as pd
from pdfminer.high_level import extract_text
from docx import Document

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a real secret key

# Define the upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load spaCy model
nlp = spacy.load("en_core_web_sm")
# Load your skills list from a CSV file
skills_df = pd.read_csv('skills.csv')
skills_list = skills_df['Skill Name'].tolist()  # Adjust column name as necessary

# Ensure the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return " ".join(paragraph.text for paragraph in doc.paragraphs)

def extract_skills(text, skills_list):
    doc = nlp(text)
    found_skills = set()
    for token in doc:
        if token.text.lower() in (skill.lower() for skill in skills_list):
            found_skills.add(token.text)
    return list(found_skills)

@app.route('/process-file', methods=['POST'])
def upload_file():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['resume']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'No selected file or file type not allowed'}), 400
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        file_type = 'pdf' if filename.endswith('.pdf') else 'docx'
        text = extract_text_from_pdf(file_path) if file_type == 'pdf' else extract_text_from_docx(file_path)
        extracted_skills = extract_skills(text, skills_list)
    except Exception as e:
        return jsonify({'error': 'Error processing file'}), 500
    finally:
        os.remove(file_path)

    return jsonify({'skills': extracted_skills})

if __name__ == '__main__':
    app.run(debug=True)
