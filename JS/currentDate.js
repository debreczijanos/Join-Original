/**
 * Displays the current date in a specific format.
 *
 * This function is executed when the page is fully loaded.
 * It sets the current date in the format "DD. Month YYYY" in an element with the ID `current-date`.
 */
document.addEventListener("DOMContentLoaded", function () {
  const dateElement = document.getElementById("current-date");
  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = today.toLocaleDateString("de-DE", options); // Example: November 7, 2024
});

/**
 * Displays the username from `localStorage` in the greeting.
 *
 * This function is executed when the page is fully loaded.
 * It reads the username from `localStorage` (or uses "Guest" as the default)
 * and updates the greeting element with the class `.greating h1`.
 */
document.addEventListener("DOMContentLoaded", function () {
  const userName = localStorage.getItem("userName") || "Guest";

  const greetingElement = document.querySelector(".greating h1");
  greetingElement.textContent = userName;
});
