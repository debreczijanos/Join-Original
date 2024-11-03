function checkInputs() {
    const inputs = document.querySelectorAll('.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]');
    let allFilled = true;

    inputs.forEach(input => {
        if ((input.type !== "checkbox" && input.value.trim() === '') || (input.type === "checkbox" && !input.checked)) {
            allFilled = false;
        }
    });

    document.getElementById('submitButton').disabled = !allFilled;
}

function handleSubmit(event) {
    event.preventDefault();
    
    // Versteckt das gesamte "center"-Div
    document.querySelector('.center').style.display = 'none';

    // Erfolgsmeldung anzeigen und Animation starten
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    successMessage.style.animation = 'slideUp 1s ease-out forwards';

    // Nach 3 Sekunden zur index.html weiterleiten
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll('.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('input', checkInputs);
        input.addEventListener('change', checkInputs); // Für Checkbox
    });

    document.getElementById('submitButton').addEventListener('click', handleSubmit);
});

function navigateToIndex() {
    window.location.href = "../index.html";
}