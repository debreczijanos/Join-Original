const ContactsURL = 'https://join-388-default-rtdb.europe-west1.firebasedatabase.app/';
const ContactSaveURL = 'https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';

async function loadContacts() {
    try {
        let response = await fetch(ContactsURL + 'contacts.json');
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
    return /*html*/`
    <div onclick="openContact(${index})">
      <div class="contact-name">
        <h3>${contact.name}</h3>
      </div>
      <div class="contact-details">
        <span>Email: ${contact.email}</span>
        <span>Phone: ${contact.phone}</span>
      </div>
    </div>`;
}


function appendContactToUI(contact) {
    const contactCard = document.getElementById('contactId');
    contactCard.innerHTML += showRenderedContactsMainData(contact.id, contact);
}

// beni , contact in firebase hinzufügen//
// Funktion zum Speichern von Benutzerdaten in Firebase
async function saveUserData(name, email, phone) {
    try {
        const response = await fetch(ContactSaveURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                phone,
            }),
        });
        if (!response.ok) {
            throw new Error('Fehler beim Speichern der Benutzerdaten');
        }
        const result = await response.json(); // Enthält die ID des neuen Eintrags
        console.log('Benutzerdaten erfolgreich gespeichert:', result);

        return { id: result.name, name, email, phone };
    } catch (error) {
        console.error('Fehler beim Speichern der Benutzerdaten:', error);
        throw error; 
    }
}


// Funktion zum Abrufen von Benutzerdaten aus Firebase
async function getUserData(email) {
    try {
        const response = await fetch(ContactSaveURL);
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