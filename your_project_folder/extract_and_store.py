import fitz  # PyMuPDF
import sqlite3

# Step 1: Extract text from the PDF
def extract_text_from_pdf(pdf_path):
    # Open the PDF
    doc = fitz.open(pdf_path)
    full_text = ""
    # Loop through each page and extract text
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text("text")
    return full_text

# Step 2: Store the extracted text in SQLite database
def store_text_in_db(text):
    # Set the correct path to save inside the public folder
    db_path = "D:/lablinker-pwa/public/pdf_knowledge.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pdf_chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT
        )
    """)

    # Optional: clear existing content before inserting new
    cursor.execute("DELETE FROM pdf_chunks")

    # Split text into small chunks (e.g., per paragraph)
    chunks = text.split("\n\n")
    for chunk in chunks:
        cleaned = chunk.strip()
        if cleaned:
            cursor.execute("INSERT INTO pdf_chunks (content) VALUES (?)", (cleaned,))

    conn.commit()
    conn.close()
    print("✅ Text extracted and stored successfully!")

# Step 3: Running the script
if __name__ == "__main__":
    pdf_path = "D:/lablinker-pwa/pdfs/lablinker.pdf"  # Replace with your actual PDF path
    text = extract_text_from_pdf(pdf_path)
    store_text_in_db(text)
    print("✅ Text extracted and stored successfully!")
