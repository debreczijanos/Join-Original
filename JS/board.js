let titles = ["Erster Titel", "Zweiter Titel", "Dritter Titel"];
let messages = ["Erste Notiz", "Zweite Notiz", "Dritte Notiz"];


function render() {
    let content = document.getElementById('content'); 
    content.innerHTML = '';  // Löscht den alten Inhalt

    for (let i = 0; i < titles.length; i++) {
        // Füge HTML für jede Notiz hinzu
        content.innerHTML += /*html*/ `
            <div class="attachment">
                <div class="distance">
                    <b>Betreff:</b> <span>${titles[i]}</span>
                    <b>Notiz:</b> <p>${messages[i]}</p>
                </div>
                <a href="#" onclick="deleteNote(${i})">
                    <img class="class-bin" src="./img/7w5aga.svg" alt="Papierkorb-Icon">
                </a>
            </div>`;
    }
}
