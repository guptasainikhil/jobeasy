import spacy
import csv
from spacy.matcher import Matcher
from pdfminer.high_level import extract_text

# Load SpaCy English model
nlp = spacy.load("en_core_web_sm")

def load_skills(skills_file):
    skills_list = []
    with open(skills_file, newline='', encoding='utf-8') as csvfile:
        skill_reader = csv.reader(csvfile)
        for row in skill_reader:
            # Assuming each skill is in the first column
            skills_list.append(row[0].lower())
    return skills_list

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_entities(text, skills_list):
    doc = nlp(text)
    entities = {
        'names': [],
        'emails': [],
        'skills': []
    }
    
    # Extract names using SpaCy NER
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            entities['names'].append(ent.text)
    
    # Extract emails using SpaCy's like_email attribute
    entities['emails'] = [token.text for token in doc if token.like_email]
    
    # Skill extraction using Matcher with skills from skills.csv
    skill_matcher = Matcher(nlp.vocab)
    for skill in skills_list:
        pattern = [{'LOWER': skill}]
        skill_matcher.add('SKILLS', patterns=[pattern])

    matches = skill_matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        entities['skills'].append(span.text)

    return entities


def parse_resume(pdf_path, skills_file):
    skills_list = load_skills(skills_file)
    text = extract_text_from_pdf(pdf_path)
    entities = extract_entities(text, skills_list)
    return entities

if __name__ == "__main__":
    # Replace 'path_to_your_resume.pdf' and 'path_to_skills.csv' with your actual file paths
    parsed_data = parse_resume('RESUME - Sai Harsha Kotha.pdf', 'skills.csv')
    print(parsed_data)
