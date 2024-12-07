const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const URLData = `${proxyUrl}https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks`;
const MaxData = 5;        
let allTasksData = []; 


function openTaskField() {
    document.getElementById('show-hide-class').classList.remove('d-none');
}


function closeTaskWindow() {
    const taskWindow = document.getElementById('show-hide-class');
    taskWindow.classList.add('d-none');
    clearFormFields(); // Felder leeren (auch bei Schließen)
}

//----------------------------------------------------------------------------------------------------------------------------------

/**
 * This funktion loads the data from the firebase
 */async function loadData() {
    try {
        for (let i = 0; i < MaxData; i++) {
            let response = await fetch(`${URLData}/${i}.json`); // JSON-Endpunkt abrufen                     
            if (!response.ok) throw new Error(`Fehler beim Abrufen von ID ${i}`);
            let newResponse = await response.json();
            allTasksData.push(newResponse); // Daten ins Array speichern                 
        }
        console.log(allTasksData);                 
        renderLoadedData();            
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
    }
}

function renderLoadedData() {
    let dataCard = document.getElementById('miniCards');
    dataCard.innerHTML = ''; // Vorherigen Inhalt löschen             
    allTasksData.forEach((data, index) => {
        let html = createTaskTemplate(data, index); // Template generieren                 
        dataCard.innerHTML += html; // HTML in den Container einfügen            
    });
}

function createTaskTemplate(data, index) {
    // Rückgabe eines HTML-Templates basierend auf den Daten             
    return `                 
        <div onclick="openCard(${index})" class="mini-card">                 
            <div>                         
                <span>${data?.title || "Unbekannt"}</span> <!-- Nutze 'title' oder Standardwert -->                     
            </div>                 
        </div>`;
    }


function openCard(){
    
}


//---------------------------------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    const priorityButtons = document.querySelectorAll(".priority-button");
    priorityButtons.forEach((button) => {
        button.addEventListener("click", function () {
            priorityButtons.forEach((btn) => btn.classList.remove("selected"));
            button.classList.add("selected");
        });
    });
});
  
  
function collectTaskData() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    const assigned = document.getElementById('assigned').value;
    const category = document.getElementById('category').value;

    const priority = document.querySelector('.priority-buttons .selected')?.textContent || 'Low';

    const subtasks = Array.from(document.querySelectorAll('#subtask-list li .subtask-text')).map(item => item.textContent);

    return {
        title,
        description,
        dueDate,
        assigned,
        priority,
        category,
        subtasks
    };
}

function addSubtask() {
    const input = document.getElementById('subtask-input');
    const subtaskList = document.getElementById('subtask-list');

    if (input.value.trim() !== '') {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <span class="subtask-text">${input.value}</span>
            <button class="edit-subtask" onclick="editSubtask(this)">Edit</button>
            <button class="delete-subtask" onclick="deleteSubtask(this)">Delete</button>
        `;

        subtaskList.appendChild(li);
        input.value = ''; // Leeren des Input-Felds nach Hinzufügen
    }
}

function editSubtask(button) {
    const subtaskText = button.parentElement.querySelector('.subtask-text');
    const newText = prompt('Edit your subtask:', subtaskText.textContent);

    if (newText !== null && newText.trim() !== '') {
        subtaskText.textContent = newText.trim();
    }
}

function deleteSubtask(button) {
    const li = button.parentElement;
    li.remove();
}

function clearFormFields() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('due-date').value = '';
    document.getElementById('assigned').value = '';
    document.getElementById('category').value = '';
    document.getElementById('subtask-list').innerHTML = '';

    const priorityButtons = document.querySelectorAll('.priority-button');
    priorityButtons.forEach(btn => btn.classList.remove('selected'));
}

function validateForm() {
    let isValid = true;

    const requiredFields = [
        { id: 'title', message: 'This field is required.' },
        { id: 'due-date', message: 'This field is required.' },
        { id: 'category', message: 'This field is required.' }
    ];

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorMessage = input.nextElementSibling;

        // Bestehende Fehlermeldung entfernen
        if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.remove();
        }

        // Validierung prüfen
        if (!input.value.trim()) {
            isValid = false;
            const error = document.createElement('div');
            error.classList.add('error-message');
            error.textContent = field.message;
            input.insertAdjacentElement('afterend', error);
        }
    });

    return isValid;
}

// Aufgabe erstellen
async function createTask() {
    if (!validateForm()) return; // Abbruch, wenn Validierung fehlschlägt

    const taskData = collectTaskData();
    const apiUrl = "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Erstellen der Aufgabe: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Erfolgreich erstellt:', data);

        // Eingabefelder zurücksetzen und Fenster schließen
        clearFormFields();
        closeTaskWindow();
    } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
    }
}


// ----------------------------------------------------------------------------------------------------


