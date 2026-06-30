const currentYear = document.querySelector('#currentyear');
currentYear.textContent = new Date().getFullYear();

const lastModified = document.querySelector('#lastModified');
lastModified.textContent = `Last Modified: ${document.lastModified}`;