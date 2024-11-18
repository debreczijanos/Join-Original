const ContactsURL = 'https://join-388-default-rtdb.europe-west1.firebasedatabase.app/';

async function loadContacts() {
    try {
        let response = await fetch(ContactsURL + 'users.json');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log("fetched Data:", data);
        renderContacts(Object.values(data));
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
    }
}


function renderContacts(allContacts) {
    let contactCard = document.getElementById('contactId');
    contactCard.innerHTML = '';

    for (let i = 0; i < allContacts.length; i++) {
        const contact = allContacts[i];


        const name = contact.name || "No Name";
        const email = contact.email || "No Email";
        const phone = contact.phone || "No Phone;"

        contactCard.innerHTML += showRenderedContactsMainData(i, {
            name,
            email,
            phone
        });

    }
}


function showRenderedContactsMainData(index, contact) {
    return /*html*/ `
    <div onclick="openContact(${index})">
      <div class="contact-name">
        <h3>${contact.name}</h3>
      </div>
      <div class="contact-details">
        <span>Email: ${contact.email}</span>
        <span>Phone: ${contact.phone}</span>
      </div>
    </div>
  `
} 

/** beni , contact in firebase hinzufügen
 * 
 */


// Funktion zum Speichern von Benutzerdaten in Firebase
async function saveUserData(name, email, phone) {
  try {
      const response = await fetch('https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, phone })
      });
      if (!response.ok) {
          throw new Error('Fehler beim Speichern der Benutzerdaten');
      }
      console.log('Benutzerdaten erfolgreich gespeichert');
  } catch (error) {
      console.error('Fehler beim Speichern der Benutzerdaten:', error);
  }
}

// Funktion zum Abrufen von Benutzerdaten aus Firebase
async function getUserData(email) {
  try {
      const response = await fetch('https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json');
      const usersData = await response.json();

      for (const userId in usersData) {
          const user = usersData[userId];
          if (user.email === email) {
              return user;
          }
      }
      return null;
  } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      return null;
  }
}

// Beispiel für die Verwendung der Funktionen
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
      const user = await getUserData(email);
      if (user && user.password === password) {
          window.location.href = "./html/board.html";
      } else {
          document.querySelector('.error').style.display = 'block';
      }
  } catch (error) {
      console.error('Fehler beim Login:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
  }
}




