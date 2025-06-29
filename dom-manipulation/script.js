// Load or initialize quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dynamically in dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const selected = localStorage.getItem("lastFilter") || "all";

  // Clear existing options except "All"
  select.innerHTML = `<option value="all">All Categories</option>`;
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selected) option.selected = true;
    select.appendChild(option);
  });
}

// Show a random quote (ignores filter)
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    display.textContent = "No quotes available.";
    return;
  }
  const random = Math.floor(Math.random() * quotes.length);
  const quote = quotes[random];
  display.innerHTML = `<p>"${quote.text}"</p><p><strong>Category:</strong> ${quote.category}</p>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Show filtered quotes
function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", filter);

  const display = document.getElementById("quoteDisplay");
  const filtered = filter === "all" ? quotes : quotes.filter(q => q.category === filter);

  if (filtered.length === 0) {
    display.textContent = "No quotes found for this category.";
    return;
  }

  const list = filtered.map(q => `<p>"${q.text}" <br><small>(${q.category})</small></p>`).join("<hr>");
  display.innerHTML = list;
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill in both fields.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories(); // ✅ Update dropdown
  filterQuotes();       // ✅ Refresh view
}

// Build input form dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  document.body.appendChild(formDiv);
}

// Export quotes as JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid format.");
      }
    } catch (err) {
      alert("Failed to import quotes.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Load last viewed quote
function loadLastQuoteOrFilter() {
  const lastFilter = localStorage.getItem("lastFilter");
  populateCategories();
  if (lastFilter && lastFilter !== "all") {
    document.getElementById("categoryFilter").value = lastFilter;
    filterQuotes();
  } else {
    showRandomQuote();
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  loadLastQuoteOrFilter();
});
