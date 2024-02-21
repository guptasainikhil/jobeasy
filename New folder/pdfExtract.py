import spacy
import pandas as pd
from pdfminer.high_level import extract_text
from docx import Document

# Load spaCy's English-language model
nlp = spacy.load("en_core_web_sm")

# Read skills into a list from the CSV file
# Make sure to replace 'file-Mo45BLnrimVLZKDl9AEqMsoc' with the correct path or name of your skills CSV file
skills_df = pd.read_csv('skills.csv')
print(skills_df.columns)
skills_list = skills_df.columns.tolist()  # Replace 'Skills' with the correct column name if different

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

# Function to extract text from a DOCX file
def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return " ".join(paragraph.text for paragraph in doc.paragraphs)

# Function to extract skills from text using spaCy and the skills list
def extract_skills(text, skills_list):
    doc = nlp(text)
    found_skills = set()
    # Iterate over the skills list and check if each skill is in the text
    for skill in skills_list:
        if skill.lower() in text.lower():
            found_skills.add(skill)
    return list(found_skills)

# Main function to process resumes and extract skills
# Main function to process resumes and extract skills
def process_resume(file_path, file_type, skills_list):
    text = ''
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        text = extract_text_from_docx(file_path)
    
    # Extract skills from the resume text
    skills = extract_skills(text, skills_list)

    return {
        "text": text,  # The raw text of the resume
        "skills": skills  # Extracted skills list
    }

# Example usage
if __name__ == "__main__":
    # Update the file path to the location of your resume file
    file_path = 'demo.pdf'  # Update this path
    file_type = 'pdf'  # or 'docx' for DOCX files

    resume_data = process_resume(file_path, file_type, skills_list)
    print("Extracted Text:", resume_data["text"])
    print("Extracted Skills:", resume_data["skills"])