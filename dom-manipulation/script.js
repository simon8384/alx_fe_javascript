// Initial quote array
let quotes = [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Function to show a random quote
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    display.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  display.innerHTML = `<p>"${quote.text}"</p><p><strong>Category:</strong> ${quote.category}</p>`;
}

// Function to add a new quote
function addQuote() {
  const quoteInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote); // ✅ Add to quotes array
  showRandomQuote();     // ✅ Update DOM

  // Clear input fields
  quoteInput.value = "";
  categoryInput.value = "";
}

// Function to create the form dynamically (per ALX spec)
function createAddQuoteForm() {
  const container = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);

  document.body.appendChild(container);
}

// ✅ Setup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listener to “Show New Quote” button
  const showButton = document.getElementById("newQuote");
  if (showButton) {
    showButton.addEventListener("click", showRandomQuote);
  }

  // Call createAddQuoteForm to dynamically build the form
  createAddQuoteForm();

  // Show an initial quote
  showRandomQuote();
});
