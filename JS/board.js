function openTaskField() {
    document.getElementById('show-hide-class').classList.remove('d-none');
}

function closeTaskWindow() {
    document.getElementById('show-hide-class').classList.add('d-none');
}

function selectPriority(button) {
    const priorityButtons = document.querySelectorAll('.priority-button');
    priorityButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function collectTaskData() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
    const assigned = document.getElementById('assigned').value;
    const category = document.getElementById('category').value;

    const priority = document.querySelector('.priority-buttons .selected')?.textContent || 'Low';

    const subtasks = Array.from(document.querySelectorAll('#subtask-list li')).map(item => item.textContent);

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
        li.textContent = input.value;
        subtaskList.appendChild(li);
        input.value = ''; // Eingabefeld zurücksetzen
    }
}

async function createTask() {
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
    } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
    }
}
