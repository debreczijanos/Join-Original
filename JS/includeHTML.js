async function includeHTML(selector, file) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Fehler beim Laden der Datei: ${file}`);
    const content = await response.text();
    document.querySelector(selector).innerHTML = content;
  } catch (error) {
    console.error(error);
  }
}
