const BASE_URL = 'https://join-388-default-rtdb.europe-west1.firebasedatabase.app/';


/**
 * This function load the data from Firebase database.
 * 
 * @param {string} path - The path of the firebase.
 */
async function getData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return await response.json();
}

/**
 *  This function save the data in Firebase database.
 * 
 * @param {string} path - The path of the firebase.
 * @param {string} data - The data to save in firebase.
 */
async function postData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * This function update the firebase database.
 * 
 * @param {string} path - The path of the firebase.
 * @param {string} data - The data to save in firebase.
 */
async function putData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * This function delete entries in firebase.
 * 
 * @param {string} path - Path from the entrie. 
 */
async function deleteDate(path = "") {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
  return await response.json();
}