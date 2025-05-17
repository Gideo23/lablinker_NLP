from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_cpp import Llama
import sqlite3
import re

app = Flask(__name__)
# Allow CORS for all routes, all origins, and support OPTIONS preflight
CORS(app, resources={r"/query": {"origins": "*"}}, supports_credentials=True)

# Load the model
llm = Llama(
    model_path="D:/lablinker-pwa/backend/models/llama-2-7b.Q4_K_M.gguf",
    n_ctx=2048,
    n_threads=6
)

# Simple RAG: retrieve from DB, then query LLaMA
def search_db(user_query):
    conn = sqlite3.connect("../public/pdf_knowledge.db")
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM pdf_chunks WHERE content LIKE ?", ('%' + user_query + '%',))
    results = cursor.fetchall()
    conn.close()
    return " ".join([r[0] for r in results])

@app.route("/query", methods=["POST"])
def query():
    data = request.json
    user_query = data.get("question", "")
    context = search_db(user_query)
    prompt = f"Context: {context}\n\nQuestion: {user_query}\nAnswer:"

    try:
        response = llm(prompt, max_tokens=200)
        answer = response["choices"][0]["text"].strip()
        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Error while generating response: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Start the server
if __name__ == "__main__":
    app.run(port=5000)





