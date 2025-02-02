/**
 * Loads an external HTML file into a specific element and optionally executes a callback function.
 *
 * @param {string} selector - The CSS selector of the element into which the HTML content should be inserted.
 * @param {string} file - The path to the HTML file to be loaded.
 * @param {Function} [callback] - An optional callback function that will be executed after the content is loaded.
 */
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
          setTimeout(callback, 0);
        }
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  includeHTML("#include-container", "./nav.html", function () {
    if (typeof initializeHeader === "function") {
      initializeHeader();
    } else {
      console.error("initializeHeader is not defined");
    }
  });
});
