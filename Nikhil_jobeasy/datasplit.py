import pandas as pd
import mysql.connector
from sqlalchemy import create_engine
from urllib.parse import quote_plus

# Database connection variables
host = "localhost"  # "localhost" or an IP address
user = "root"  # your MySQL username
passwd = quote_plus("Nikhil@2000")  # URL-encode the password
db = "jobeasy"  # your MySQL database name

# Create a connection to the database
engine = create_engine(f'mysql+mysqlconnector://{user}:{passwd}@{host}/{db}')
# Path to your CSV file
csv_file = '/Users/vsainithya/Downloads/job_descriptions 2.csv'

# Read the CSV file in chunks
chunksize = 5000 # Number of rows per chunk
with pd.read_csv(csv_file, chunksize=chunksize) as reader:
    for chunk in reader:
        # Process the chunk (e.g., clean data, transform, etc.)

        # Insert data into the database
        chunk.rename(columns={
    'Experience': 'Experience',
    'Qualifications': 'Qualifications',
    'Salary Range': 'Salary Range',
    'location': 'location',
    'Country': 'Country',
    'Work Type': 'Work Type',
    'Job Posting Date': 'Job Posting Date',
    'Job Title': 'Job Title',
    'Role': 'Role',
    'Job Portal': 'Job Portal',
    'Job Description': 'Job Description',
    'skills': 'skills',
    'Responsibilities': 'Responsibilities',
    'Company': 'Company'
}, inplace=True)


        chunk.to_sql('Jobs_dataset', con=engine, if_exists='append', index=False)

print("Data import complete.")
