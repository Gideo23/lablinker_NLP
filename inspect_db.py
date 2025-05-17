import sqlite3

conn = sqlite3.connect("pdf_knowledge.db")
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("Tables found:", tables)

# Optional: show columns in 'pdf_chunks'
if ('pdf_chunks',) in tables:
    cursor.execute("PRAGMA table_info(pdf_chunks);")
    print("pdf_chunks schema:", cursor.fetchall())
else:
    print("❌ 'pdf_chunks' table does not exist.")

conn.close()