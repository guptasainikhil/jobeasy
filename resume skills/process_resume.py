import sys
import spacy
import pandas as pd
from pdfminer.high_level import extract_text
from docx import Document
import json

# Load spaCy's English-language model
nlp = spacy.load("en_core_web_sm")

# Read skills into a list from the CSV file
skills_df = pd.read_csv('skills.csv')
skills_list = skills_df.columns.tolist()  # Assumes the first row contains skill names

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return " ".join(paragraph.text for paragraph in doc.paragraphs)

def assign_skill_weights(text, skills_list, section_headings):
    skill_details = {}
    current_section = None

    # Convert section headings to lowercase for case-insensitive comparison
    section_headings_lower = {heading.lower(): heading for heading in section_headings}

    for line in text.split('\n'):
        line_clean = line.strip().lower()
        # Check if the line is a section heading
        if line_clean in section_headings_lower:
            current_section = section_headings_lower[line_clean]

        # Assign weight based on current section
        weight = 0.5
        if current_section:
            if "skills" in current_section.lower():
                weight = 1.0
            elif "experience" in current_section.lower() or "work" in current_section.lower():
                weight = 0.8

        # Check each word in the line for skills
        words = line.split()
        for word in words:
            word_lower = word.lower().strip(",. ")
            if word_lower in skills_list:
                if word_lower not in skill_details:
                    skill_details[word_lower] = {'weight': 0, 'sections': set()}
                skill_details[word_lower]['weight'] += weight
                skill_details[word_lower]['sections'].add(current_section)

    return skill_details

def process_resume(file_path, file_type, skills_list, section_headings):
    text = ''
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        text = extract_text_from_docx(file_path)

    skills_lower = [skill.lower() for skill in skills_list]
    skill_details = assign_skill_weights(text, skills_lower, section_headings)

    return skill_details

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: script.py <file_path> <file_type>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    file_type = sys.argv[2]  # 'pdf' or 'docx'
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

    skill_details = process_resume(file_path, file_type, skills_list, section_headings)
    # Output the skills, their weights, and the sections they were found in
    print(json.dumps(skill_details, indent=4))
