const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Simulated mock API
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let selectedCategory = localStorage.getItem("selectedCategory") || "all";
let lastSync = parseInt(localStorage.getItem("lastSync")) || 0;

// Save quotes and sync time
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSelectedCategory() {
  localStorage.setItem("selectedCategory", selectedCategory);
}

function saveLastSync() {
  localStorage.setItem("lastSync", Date.now().toString());
}

// Notification banner
function showNotification(message, isError = false) {
  let existing = document.getElementById("syncNotif");
  if (!existing) {
    existing = document.createElement("div");
    existing.id = "syncNotif";
    Object.assign(existing.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      padding: "10px",
      borderRadius: "5px",
      color: "#fff",
      backgroundColor: isError ? "#d32f2f" : "#388e3c",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      zIndex: 1000,
    });
    document.body.appendChild(existing);
  }
  existing.textContent = message;
  setTimeout(() => existing.remove(), 4000);
}

// Fetch quotes from server (simulated)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: post.body.split(" ")[0] || "General",
      updated: Date.now()
    }));

    return serverQuotes;
  } catch (err) {
    showNotification("Failed to fetch from server", true);
    return [];
  }
}

// Sync local and server data
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  let added = 0, updated = 0;

  serverQuotes.forEach(sq => {
    const localMatch = quotes.find(q => q.text === sq.text);
    if (!localMatch) {
      quotes.push(sq);
      added++;
    } else if (!localMatch.updated || localMatch.updated < sq.updated) {
      Object.assign(localMatch, sq);
      updated++;
    }
  });

  if (added || updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification(`${added} new, ${updated} updated from server`);
  }

  saveLastSync();
}

// Post a new quote to the server (simulation)
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch {
    showNotification("Failed to post to server", true);
  }
}

// Add new quote locally and sync
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please enter both fields.");

  const newQuote = { text, category, updated: Date.now() };
  quotes.push(newQuote);
  saveQuotes();
  postQuoteToServer(newQuote);

  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Random quote
function showRandomQuote() {
  if (!quotes.length) return;
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${q.text}"</p><p><strong>(${q.category})</strong></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

// Filter dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;
  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedCategory) opt.selected = true;
    select.appendChild(opt);
  });
}

// Filter quotes by category
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  saveSelectedCategory();

  const list = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  const display = document.getElementById("quoteDisplay");

  if (!list.length) {
    display.innerHTML = `<p>No quotes in this category.</p>`;
  } else {
    display.innerHTML = list.map(q =>
      `<p>"${q.text}"<br><small>(${q.category})</small></p>`
    ).join("<hr>");
  }
}

// Import from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Export to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Dynamically create the add-quote form
function createAddQuoteForm() {
  const form = document.createElement("div");
  form.className = "form-container";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter quote text";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.placeholder = "Enter category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  form.appendChild(textInput);
  form.appendChild(catInput);
  form.appendChild(addBtn);

  document.body.appendChild(form);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  syncQuotes();
  setInterval(syncQuotes, 60000); // every 60 seconds
});
