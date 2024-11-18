document.addEventListener("DOMContentLoaded", function () {
  const dateElement = document.getElementById("current-date");
  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = today.toLocaleDateString("de-DE", options); // Beispiel: November 7, 2024
});

document.addEventListener("DOMContentLoaded", function () {
  // Benutzernamen aus localStorage abrufen
  const userName = localStorage.getItem("userName") || "Guest";

  // Begrüßungselement aktualisieren
  const greetingElement = document.querySelector(".greating h1");
  greetingElement.textContent = userName;
});
