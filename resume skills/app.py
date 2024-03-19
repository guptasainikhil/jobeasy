from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from werkzeug.utils import secure_filename
import os
import spacy
import pandas as pd
from collections import Counter
from pdfminer.high_level import extract_text
from docx import Document

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a real secret key

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

nlp = spacy.load("en_core_web_sm")
skills_df = pd.read_csv('skills.csv')
skills_list = skills_df.columns.tolist()

section_headings = [
    "Work Experience", "Experience", "Professional Experience", "Employment History",
    "Education", "Academic Background", "Qualifications",
    "Skills", "Technical Skills", "Professional Skills", "Skill Highlights",
    "Certifications", "Licenses",
    "Projects", "Key Projects",
    "Awards", "Achievements", "Honors",
    "Publications",
    "Conferences", "Presentations",
    "Languages",
    "Volunteer Work", "Volunteer Experience",
    "Interests", "Hobbies", "Personal Interests",
    "References", "Professional References"
]

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return " ".join(paragraph.text for paragraph in doc.paragraphs)

def assign_skill_weights(text, skills_list, section_headings):
    skill_details = {}
    current_section = None
    section_headings_lower = {heading.lower(): heading for heading in section_headings}

    for line in text.split('\n'):
        line_clean = line.strip().lower()
        if line_clean in section_headings_lower:
            current_section = section_headings_lower[line_clean]

        weight = 0.5
        if current_section:
            if "skills" in current_section.lower():
                weight = 1.0
            elif "experience" in current_section.lower() or "work" in current_section.lower():
                weight = 0.8

        words = line.split()
        for word in words:
            word_lower = word.lower().strip(",. ")
            if word_lower in skills_list:
                if word_lower not in skill_details:
                    skill_details[word_lower] = {'weight': 0, 'sections': set()}
                skill_details[word_lower]['weight'] += weight
                skill_details[word_lower]['sections'].add(current_section)

    return skill_details

def process_resume(file_path, file_type):
    text = ''
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        text = extract_text_from_docx(file_path)

    skills_lower = [skill.lower() for skill in skills_list]
    skill_details = assign_skill_weights(text, skills_lower, section_headings)

    return skill_details

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'resume' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['resume']
        if file.filename == '' or not allowed_file(file.filename):
            flash('No selected file or file type not allowed')
            return redirect(request.url)
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            file_type = 'pdf' if filename.endswith('.pdf') else 'docx'
            skill_details = process_resume(file_path, file_type)
            # Filter and sort skills by weight
            sorted_skills = sorted(skill_details.items(), key=lambda x: (-x[1]['weight'], x[0]))[:10]  # Top 10 skills
        except Exception as e:
            flash('Error processing file')
            return redirect(request.url)
        finally:
            os.remove(file_path)

        return jsonify({'skills': [skill[0] for skill in sorted_skills]})
    return render_template('upload.html')

if __name__ == '__main__':
    app.run(debug=True)
