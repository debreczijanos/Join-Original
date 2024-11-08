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