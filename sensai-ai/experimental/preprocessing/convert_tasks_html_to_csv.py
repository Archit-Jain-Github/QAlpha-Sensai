from bs4 import BeautifulSoup
import csv

def extract_content_from_html(html_file):
    with open(html_file, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    content = []
    
    # Assuming headers (like "Basic Structure of an HTML Document") are in <h2>, objectives in <p>, and steps in <ul>/<li>
    sections = soup.find_all('h2')  # Change the tag based on your HTML structure
    
    for section in sections:
        name = section.get_text()
        description_tag = section.find_next('p')
        description = description_tag.get_text() if description_tag else ""
        
        # Find all the list items (assuming they contain the details)
        list_items = section.find_next('ul').find_all('li')
        details = " ".join([item.get_text() for item in list_items])
        
        # Assuming tags are extracted based on presence of certain keywords
        if "HTML" in name:
            tags = ["HTML"]
        elif "CSS" in name:
            tags = ["CSS"]
        else:
            tags = []
        
        content.append([name, description, details, tags])
    
    return content

def write_to_csv(content, output_csv):
    # Write the extracted content to a CSV file
    with open(output_csv, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Name", "Description", "Details", "Tags"])
        writer.writerows(content)

# Example usage
html_file = 'FrontendSensai.html'  # Path to your HTML file
output_csv = 'output_file.csv'  # Path to the output CSV file

content = extract_content_from_html(html_file)
write_to_csv(content, output_csv)

print("CSV file has been created successfully.")
