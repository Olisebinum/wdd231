export function setSectionSelection(sections) {
  const selectElement = document.querySelector("#sectionNumber");
  selectElement.innerHTML = '<option value="">--</option>';

  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section.number;
    option.textContent = section.number;
    selectElement.appendChild(option);
  });
}