export function setTitle(course) {
  document.querySelector("#courseTitle").textContent = course.title;
  document.querySelector("#courseCode").textContent = course.code;
}

export function renderSections(sections) {
  const tbody = document.querySelector("#sectionsBody");
  tbody.innerHTML = "";

  sections.forEach((section) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${section.number}</td>
      <td>${section.enrolled}</td>
      <td>${section.instructor}</td>
    `;
    tbody.appendChild(row);
  });
}