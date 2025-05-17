// load database
async function loadKnowledgeDB() {
  try {
    const SQL = await window.initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    const response = await fetch('/public/pdf_knowledge.db');
    const buffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));

    window.knowledgeDB = db;
    console.log("✅ Knowledge DB loaded");
  } catch (error) {
    console.error("❌ Error loading knowledge database:", error);
  }
}
document.addEventListener('DOMContentLoaded', loadKnowledgeDB);

 // perform keyword search
window.searchKnowledge = function () {
  const input = document.getElementById("queryInput").value.toLowerCase();
  const output = document.getElementById("responseOutput");

  try {
    const stmt = window.knowledgeDB.prepare(`
      SELECT content FROM pdf_chunks
      WHERE LOWER(content) LIKE $search
      LIMIT 5
    `);

    stmt.bind({ $search: `%${input}%` });

    let results = "";
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results += `<p>🔍 ${row.content}</p><hr>`;
    }

    if (results) {
      output.innerHTML = results;
    } else {
      output.innerHTML = "❌ No matching content found.";
    }

    stmt.free();
  } catch (error) {
    output.innerHTML = `❌ Error searching PDF: ${error.message}`;
  }
};

document.addEventListener('DOMContentLoaded', loadKnowledgeDB);

window.askAI = async function () {
  const input = document.getElementById("queryInput").value;
  const queryBox = document.getElementById("translatedQuery");

  let sql = "";

  // Check for specific queries
  if (input.toLowerCase().includes("test name")) {
    sql = "SELECT patient_id, test_name, result_value FROM lab_data;";
  } else if (input.toLowerCase().includes("all results")) {
    sql = "SELECT * FROM lab_data;";
  } else {
    queryBox.textContent = "❌ Could not translate question to SQL.";
    return;
  }

  queryBox.textContent = `🔍 Translated to SQL: ${sql}`;
  document.getElementById("queryInput").value = sql;
  runQuery(); // uses the function already defined below
};

// When user clicks "Ask"
window.runQuery = function () {
  const input = document.getElementById("queryInput").value;
  const output = document.getElementById("responseOutput");

  try {
    const result = window.labDB.exec(input);
    if (result.length > 0) {
      const columns = result[0].columns;
      const values = result[0].values;

      // Build HTML table
      let html = '<table border="1" cellpadding="5" cellspacing="0"><tr>';
      columns.forEach(col => {
        html += `<th>${col}</th>`;
      });
      html += '</tr>';

      values.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += `<td>${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</table>';

      output.innerHTML = html;
    } else {
      output.textContent = "No results found.";
    }
  } catch (error) {
    output.textContent = `❌ Error: ${error.message}`;
  }
};

// Get from "PDF"
window.askPDF = function () {
  const input = document.getElementById("queryInput").value.toLowerCase();
  const output = document.getElementById("responseOutput");

  try {
    // Search 'pdf_chunks' table for text similar to the question
    const stmt = window.labDB.prepare("SELECT content FROM pdf_chunks WHERE content LIKE ? LIMIT 5");
    const keyword = `%${input.split(" ").join("%")}%`;
    const results = [];

    while (stmt.step()) {
      const row = stmt.getAsObject({ 1: keyword });
      results.push(row.content);
    }

    stmt.free();

    if (results.length > 0) {
      output.innerHTML = results.map(r => `<p>🔹 ${r}</p>`).join("");
    } else {
      output.textContent = "No matching information found.";
    }
  } catch (error) {
    output.textContent = `❌ Error searching PDF: ${error.message}`;
  }
};