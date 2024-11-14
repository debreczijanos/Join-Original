//  HTML-Include
function includeHTML(containerSelector, filePath) {
  const container = document.querySelector(containerSelector);
  if (container) {
    fetch(filePath)
      .then((response) => response.text())
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}

includeHTML("#include-container", "./nav.html");

//Button-Management (Prio-Buttons)
//Entfernen aktiver Zustände
function clearActiveStates(buttons) {
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    const img = btn.querySelector("img");
    if (img) img.classList.remove("filter-color-to-white");
  });
}

//Aktivieren eines Buttons
function activateButton(button) {
  button.classList.add("active");
  const img = button.querySelector("img");
  if (img) img.classList.add("filter-color-to-white");
}

//Event-Listener für Buttons
function setupButtonListeners(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      clearActiveStates(buttons);
      activateButton(button);
    });
  });
}

const buttons = document.querySelectorAll(".prio-btn button");
setupButtonListeners(buttons);
