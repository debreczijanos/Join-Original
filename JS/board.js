function openTaskField(){
    document.getElementById('content').innerHTML = showTaskField();
}

function showTaskField(){
    return /*html*/`

    <div class="background-box">
    
        <div class="great-open-Task">
            <div class="title-and-out">
                <h2>Add Task</h2>
                <span>xmark</span>
            </div>



        <div class="form-section">
            <div class="first-form">
                <form>
                    <label for="title">Titel<span class="required">*</span></label>
                    <input type="text" id="title" placeholder="Enter a title" required>

                    <label for="description">Beschreibung</label>
                    <textarea id="description" placeholder="Enter a Description"></textarea>

                    <label for="assigned">Zugewiesen an</label>
                    <select id="assigned">
                        <option value="" disabled selected>Select contacts to assign</option>
                    </select>
                </form>
            </div>

            <div class="division-line"></div>

            <div class="second-form">
                    <form>
                        <label for="due-date">Fälligkeitsdatum<span class="required">*</span></label>
                        <div class="date-input">
                            <input type="text" id="due-date" placeholder="dd/mm/yyyy" required>
                            <span class="calendar-icon">📅</span>
                        </div>

                        <label for="priority">Prio</label>
                        <div class="priority-buttons">
                            <div class="priority-button urgent">Urgent ⬆️</div>
                            <div class="priority-button medium">Medium =</div>
                            <div class="priority-button low">Low ⬇️</div>
                        </div>

                        <label for="category">Kategorie<span class="required">*</span></label>
                        <select id="category" required>
                            <option value="" disabled selected>Select task category</option>
                        </select>

                        <label for="subtasks">Unteraufgaben</label>
                        <div class="subtasks">
                            <input type="text" id="subtasks" placeholder="Add new subtask">
                            <div class="add-subtask-button">+</div>
                        </div>
                    </form>
            </div>

        </div>


            <div></div>
        </div>
    
    </div>
    `; 
}