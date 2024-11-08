// URL zu deinem Firebase-Realtime-Datenbank-Endpoint für "users"
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json"; // Pfad zu den "users"

// Funktion, um das Dropdown-Menü anzuzeigen/auszublenden
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
}

// Funktion, um die Liste basierend auf der Eingabe im Suchfeld zu filtern
function filterList() {
  const input = document.getElementById("dropdownInput");
  const filter = input.value.toLowerCase();
  const labels = document.querySelectorAll(".dropdown-menu label");

  labels.forEach((label) => {
    const text = label.textContent || label.innerText;
    if (text.toLowerCase().indexOf(filter) > -1) {
      label.style.display = "";
    } else {
      label.style.display = "none";
    }
  });
}

// Funktion, um Kontakte von der API zu holen und im Dropdown-Menü anzuzeigen
async function loadContacts() {
  try {
    const response = await fetch(apiURL); // Anfrage an Firebase senden
    const data = await response.json(); // JSON-Daten der Antwort extrahieren

    const dropdownMenu = document.getElementById("dropdownMenu");
    dropdownMenu.innerHTML = ""; // Existierende Inhalte löschen

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const contact = data[key];

        // Jedes Benutzerobjekt wird als Label mit Checkbox eingefügt
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = contact.name; // Name des Kontakts

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(contact.name));
        dropdownMenu.appendChild(label);
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

// Funktion wird einmal beim Laden der Seite aufgerufen, um die Kontakte zu laden
window.onload = loadContacts;

// Dropdown schließen, wenn man außerhalb klickt
window.onclick = function (event) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  if (!event.target.matches("#dropdownInput")) {
    dropdownMenu.style.display = "none";
  }
};
