/**
 * Prevents the default form submission and sends a message to the parent document
 * to notify about the successful task creation.
 *
 * @param {Event} event - The event object passed from the form submit.
 */
function submitTask(event) {
  event.preventDefault(); // Prevents the default redirection

  console.log("Task successfully created!");
  parent.postMessage("taskSuccess", "*"); // Send message to the parent document
}

/**
 * Listens for messages from the iframe and displays a success message on success,
 * closes the overlay, and reloads the page.
 */
window.addEventListener("message", function (event) {
  if (event.data && event.data.type === "taskSuccess") {
    const successOverlay = document.getElementById("overlay");
    successOverlay.style.display = "flex";

    setTimeout(() => {
      successOverlay.style.display = "none";
      closeAddTask(); // Close the overlay
      location.reload(); // Reload the page
    }, 3000);
  }
});

/**
 * Closes the overlay window and resets the iframe.
 */
function closeAddTask() {
  const overlay = document.getElementById("iframeOverlay");
  if (overlay) {
    overlay.classList.add("d-none");
  }
  const iframe = document.getElementById("overlayFrame");
  if (iframe) {
    iframe.src = ""; // Resets the iframe
  }
}

/**
 * Receives messages from the iframe and closes the overlay
 * when a `closeOverlay` action is received.
 */
window.addEventListener("message", function (event) {
  if (event.data && event.data.action === "closeOverlay") {
    // Close the overlay and reset the iframe
    const overlay = document.getElementById("iframeOverlay");
    if (overlay) {
      overlay.classList.add("d-none");
      document.getElementById("overlayFrame").src = ""; // Reset iframe content
    }
  }
});

/**
 * Closes the overlay when a click occurs outside the iframe.
 * @param {MouseEvent} event - The click event.
 */
function closeOverlayOnClick(event) {
  const overlay = document.getElementById("iframeOverlay");
  const overlayContent = document.querySelector(".iframe-overlay-content");

  // Checks if the click was outside the overlay content
  if (event.target === overlay) {
    closeAddTask();
  }
}

// Adds the event listener when the page loads
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("iframeOverlay");
  if (overlay) {
    overlay.addEventListener("click", closeOverlayOnClick);
  }
});
