import spacy
from pdfminer.high_level import extract_text
from docx import Document

# Load spaCy's English-language model
nlp = spacy.load("en_core_web_sm")

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

# Function to extract text from a DOCX file
def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return " ".join(paragraph.text for paragraph in doc.paragraphs)

# Function to extract skills from text using spaCy
def extract_skills(text):
    doc = nlp(text)
    skills = []
    # Assuming 'skills' could be recognized as 'NOUN' or part of noun chunks
    for chunk in doc.noun_chunks:
        skills.append(chunk.text)
    return skills

# Main function to process resumes and extract skills
def process_resume(file_path, file_type):
    text = ''
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        text = extract_text_from_docx(file_path)
    
    # Extract skills from the resume text
    skills = extract_skills(text)

    return {
        "text": text,  # The raw text of the resume
        "skills": skills  # Extracted skills list
    }

# Example usage
if __name__ == "__main__":
    # Update the file path to the location of your resume file
    file_path = 'RESUME - Sai Harsha Kotha.pdf'  # Update this path
    file_type = 'pdf'  # or 'docx' for DOCX files

    resume_data = process_resume(file_path, file_type)
    print("Extracted Text:", resume_data["text"])
    print("Extracted Skills:", resume_data["skills"])
