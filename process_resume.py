import sys
import spacy
import pandas as pd
from pdfminer.high_level import extract_text
from docx import Document
import json

nlp = spacy.load("en_core_web_sm")
skills_df = pd.read_csv('skills.csv')
skills_list = skills_df.columns.tolist()

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return " ".join(paragraph.text for paragraph in doc.paragraphs)

def extract_skills(text, skills_list):
    doc = nlp(text)
    found_skills = set()
    skills_lower = [skill.lower() for skill in skills_list]

    for token in doc:
        if token.text.lower() in skills_lower or token.lemma_.lower() in skills_lower:
            found_skills.add(token.text)

    for ent in doc.ents:
        if ent.label_ in ['ORG', 'PRODUCT'] and ent.text.lower() in skills_lower:
            found_skills.add(ent.text)

    return list(found_skills)

def process_resume(file_path, file_type, skills_list):
    text = ''
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        text = extract_text_from_docx(file_path)

    skills = extract_skills(text, skills_list)
    return {"skills": skills}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: script.py <file_path> <file_type>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    file_type = sys.argv[2]  # 'pdf' or 'docx'
    resume_data = process_resume(file_path, file_type, skills_list)
    print(json.dumps(resume_data))
