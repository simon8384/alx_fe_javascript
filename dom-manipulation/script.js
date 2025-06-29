// Mock server endpoint (using JSONPlaceholder for simulation)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // simulated quotes

// Load or initialize quotes from localStorage
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let lastSync = parseInt(localStorage.getItem("lastSync")) || 0;

// Track selected category
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// Save quotes and sync time
function saveLocal() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveSyncTime() {
  lastSync = Date.now();
  localStorage.setItem("lastSync", lastSync);
}

// Populate categories dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;
  [...new Set(quotes.map(q => q.category))]
    .forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      if (cat === selectedCategory) opt.selected = true;
      select.appendChild(opt);
    });
}

// Display quotes based on filter
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const disp = document.getElementById("quoteDisplay");
  let list = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (list.length === 0) {
    disp.innerHTML = `<p>No quotes found.</p>`;
    return;
  }
  disp.innerHTML = list.map(q => `
    <p>"${q.text}"<br><small>(${q.category})</small></p>
  `).join('<hr>');
}

// Add local quote
function addQuote() {
  const t = document.getElementById("newQuoteText").value.trim();
  const c = document.getElementById("newQuoteCategory").value.trim();
  if (!t || !c) return alert("Please enter both.");

  quotes.push({ text: t, category: c, updated: Date.now() });
  saveLocal();
  populateCategories();
  filterQuotes();
}

// Display a random quote ignoring filter
function showRandomQuote() {
  if (!quotes.length) return alert("No quotes!");
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteDisplay").innerHTML = `"${q.text}" — ${q.category}`;
}

// Simulate sync: fetch from server, merge, and resolve conflicts
async function syncWithServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    let added = 0, updated = 0;

    data.slice(0, 5).forEach(item => {
      const serverQuote = {
        text: item.title,
        category: item.body.split(' ')[0],
        updated: Date.now()
      };
      const found = quotes.find(q => q.text === serverQuote.text);
      if (!found) {
        quotes.push(serverQuote);
        added++;
      } else if (found.updated < serverQuote.updated) {
        Object.assign(found, serverQuote);
        updated++;
      }
    });

    if (added || updated) {
      saveLocal();
      populateCategories();
      filterQuotes();
      showNotification(`${added} added, ${updated} updated from server`);
    }
    saveSyncTime();
  } catch {
    showNotification("Error syncing with server", true);
  }
}

// Show notification banner
function showNotification(msg, isError = false) {
  let n = document.getElementById("syncNotif");
  if (!n) {
    n = document.createElement("div");
    n.id = "syncNotif";
    Object.assign(n.style, {
      position: "fixed", top: "10px", right: "10px",
      padding: "10px", background: isError ? "#f44336" : "#4caf50",
      color: "white", borderRadius: "4px"
    });
    document.body.append(n);
  }
  n.textContent = msg;
  setTimeout(() => n.remove(), 4000);
}

// Create add-quote form
function createAddQuoteForm() {
  const f = document.createElement("div");
  f.className = "form-container";
  ["newQuoteText", "newQuoteCategory"].forEach(id => {
    const inp = document.createElement("input");
    inp.id = id;
    inp.placeholder = id === "newQuoteText" ? "Enter quote" : "Enter category";
    f.append(inp);
  });
  const btn = document.createElement("button");
  btn.textContent = "Add Quote";
  btn.onclick = addQuote;
  f.append(btn);
  document.body.append(f);
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // Run sync on load and then every minute
  syncWithServer();
  setInterval(syncWithServer, 60000);
});
