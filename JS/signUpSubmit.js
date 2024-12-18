function checkInputs() {
  const inputs = getAllInputs();
  const allFilled = validateInputs(inputs);

  updateSubmitButton(allFilled);
}

function getAllInputs() {
  return document.querySelectorAll(
    '.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]'
  );
}

function validateInputs(inputs) {
  let allFilled = true;

  inputs.forEach((input) => {
    if (isInputEmpty(input)) {
      allFilled = false;
    }
  });

  return allFilled;
}

function isInputEmpty(input) {
  return (
    (input.type !== "checkbox" && input.value.trim() === "") ||
    (input.type === "checkbox" && !input.checked)
  );
}

function updateSubmitButton(allFilled) {
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = !allFilled;
  submitButton.style.backgroundColor = allFilled ? "#2a3647" : "#d1d1d1";
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function handleSubmit(event) {
  event.preventDefault();

  const formData = collectFormData();
  if (!validateFormData(formData)) return;

  const response = await sendDataToServer(formData);
  handleServerResponse(response);
}

function collectFormData() {
  return {
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    password: document.getElementById("passwordInput").value.trim(),
    confirmPassword: document
      .getElementById("confirmPasswordInput")
      .value.trim(),
    acceptTerms: document.getElementById("acceptTerms").checked,
  };
}

function validateFormData({ email, password, confirmPassword }) {
  if (password !== confirmPassword) {
    alert("Passwörter stimmen nicht überein!");
    return false;
  }

  if (!isValidEmail(email)) {
    alert("Bitte gib eine gültige E-Mail-Adresse ein!");
    return false;
  }

  return true;
}

async function sendDataToServer({ name, email, password, acceptTerms }) {
  const url =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

  try {
    const usersData = await fetchExistingUsers(url);

    if (isEmailAlreadyRegistered(usersData, email)) {
      return { ok: false, reason: "email_exists" };
    }

    const response = await saveNewUser(url, {
      name,
      email,
      password,
      acceptTerms,
    });
    return response;
  } catch (error) {
    return handleServerError(error);
  }
}

async function fetchExistingUsers(url) {
  const response = await fetch(url);
  return response.json();
}

function isEmailAlreadyRegistered(usersData, email) {
  return usersData
    ? Object.values(usersData).some((user) => user.email === email)
    : false;
}

async function saveNewUser(url, userData) {
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

function handleServerError(error) {
  console.error("Fehler beim Senden der Anfrage:", error);
  return { ok: false, reason: "server_error" };
}

function handleServerResponse(response) {
  if (response && response.ok) {
    displaySuccessMessage();
  } else if (response.reason === "email_exists") {
    alert("Diese E-Mail-Adresse ist bereits registriert!");
  } else if (response.reason === "server_error") {
    alert("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
  } else {
    alert("Unbekannter Fehler beim Speichern der Daten.");
  }
}

function displaySuccessMessage() {
  document.querySelector(".center").style.display = "none";
  const successMessage = document.getElementById("successMessage");

  successMessage.style.display = "flex";
  successMessage.style.animation = "slideUp 1s ease-out forwards";

  setTimeout(() => (window.location.href = "../index.html"), 3000);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(
    '.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]'
  );
  inputs.forEach((input) => {
    input.addEventListener("input", checkInputs);
    input.addEventListener("change", checkInputs); // Für Checkbox
  });
});

function navigateToIndex() {
  window.location.href = "../index.html";
}
