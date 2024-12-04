/**
 * This function leads to the last page 
 */
function goToLastPage() {
    history.back();
  }

/**
 * This function open the dropdown menu.
 */
function showDropdownMenu() {
  document.getElementById("headerDropdownOption").classList.toggle("d-block");
  document.addEventListener("click", handleOutsideClick);
}

/**
 * This function close the dropdown menu.
 * 
 * @param {event} event 
 */
function handleOutsideClick(event) {
  const dropdownMenu = document.getElementById("headerDropdownOption");
  const userButton = document.getElementById("userInitials");
  if (!dropdownMenu.contains(event.target) && !userButton.contains(event.target)) {
    dropdownMenu.classList.remove("d-block");
    document.removeEventListener("click", handleOutsideClick);
  }
}

/**
 * This function logout the user.
 */
function logout(){
  localStorage.removeItem('user');
  window.location.href = 'index.html';  
}