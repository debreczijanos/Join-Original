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

async function handleSubmit(event) {
    event.preventDefault();

    // Eingabewerte sammeln
    const name = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordInput').value.trim();
    const acceptTerms = document.getElementById('acceptTerms').checked;

    // Überprüfen, ob das Passwort bestätigt wurde
    if (password !== confirmPassword) {
        alert("Passwörter stimmen nicht überein!");
        return;
    }

    // Daten, die wir speichern möchten
    const data = {
        name,
        email,
        password,
        acceptTerms
    };

    try {
        // POST-Anfrage an die Firebase API
        const response = await fetch('https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Erfolgsmeldung anzeigen und Animation starten
            document.querySelector('.center').style.display = 'none';
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            successMessage.style.animation = 'slideUp 1s ease-out forwards';

            // Nach 3 Sekunden zur index.html weiterleiten
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 3000);
        } else {
            // Fehler bei der Speicherung
            alert("Fehler beim Speichern der Daten.");
        }
    } catch (error) {
        console.error("Fehler beim Senden der Anfrage:", error);
        alert("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    }
}

// Event-Listener hinzufügen
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
