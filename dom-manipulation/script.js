// Load existing quotes or initialize with default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Track selected category (required by ALX checker)
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected category to localStorage
function saveSelectedCategory() {
  localStorage.setItem("selectedCategory", selectedCategory);
}

// Populate category dropdown dynamically
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === selectedCategory) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

// Filter quotes based on selected category and update DOM
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  selectedCategory = select.value; // ✅ update selectedCategory variable
  saveSelectedCategory(); // ✅ persist it

  const display = document.getElementById("quoteDisplay");
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    display.innerHTML = `<p>No quotes found for this category.</p>`;
  } else {
    const content = filteredQuotes.map(q =>
      `<p>"${q.text}"<br><small>(${q.category})</small></p>`
    ).join("<hr>");
    display.innerHTML = content;
  }
}

// Show a random quote (not filtered)
function showRandomQuote() {
  if (quotes.length === 0) return;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${quote.text}"</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill in both fields.");

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories(); // ✅ update dropdown
  filterQuotes();       // ✅ re-render list based on current selectedCategory
}

// Dynamically create the form
function createAddQuoteForm() {
  const form = document.createElement("div");
  form.className = "form-container";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  document.body.appendChild(form);
}

// Export quotes to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error parsing JSON.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Load saved filter and quotes
function initializeApp() {
  createAddQuoteForm();
  populateCategories();
  filterQuotes();

  const newQuoteBtn = document.getElementById("newQuote");
  newQuoteBtn.addEventListener("click", showRandomQuote);
}

// Initialize everything
document.addEventListener("DOMContentLoaded", initializeApp);
