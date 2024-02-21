from transformers import pipeline

# Assuming 'nlp' is your loaded pipeline
ner_results = nlp("Experience with Python, JavaScript, and machine learning.")

# Print raw results to understand the output format
print(ner_results)

# Example adapted processing
skills = [ent['word'] for ent in ner_results if 'SKILL' in ent['entity']]
print("Extracted Skills:", skills)
