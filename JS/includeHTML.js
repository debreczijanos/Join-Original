function includeHTML(selector, file, callback) {
  const element = document.querySelector(selector);
  if (element) {
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.text();
      })
      .then((data) => {
        element.innerHTML = data;
        if (typeof callback === "function") {
          callback(); // Führe die Callback-Funktion aus
        }
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}
