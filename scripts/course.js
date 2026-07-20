const courses = [
  {
    subject: "WDD",
    number: 130,
    title: "Web Fundamentals",
    credits: 2,
    certificate: "Web and Computer Programming",
    description: "Markup and styling language for the World Wide Web, like HTML and CSS.",
    technology: ["HTML", "CSS"],
    completed: true
  },
  {
    subject: "WDD",
    number: 131,
    title: "Dynamic Web Fundamentals",
    credits: 2,
    certificate: "Web and Computer Programming",
    description: "Building dynamic websites using JavaScript that respond to user actions.",
    technology: ["HTML", "CSS", "JavaScript"],
    completed: true
  },
  {
    subject: "WDD",
    number: 231,
    title: "Frontend Web Development I",
    credits: 2,
    certificate: "Web and Computer Programming",
    description: "Improve dynamic web pages with accessibility, modern layouts, and APIs.",
    technology: ["HTML", "CSS", "JavaScript"],
    completed: false
  },
  {
    subject: "CSE",
    number: 111,
    title: "Programming with Functions",
    credits: 2,
    certificate: "Web and Computer Programming",
    description: "Programming with functions using a structured language like Python.",
    technology: ["Python"],
    completed: true
  },
  {
    subject: "CSE",
    number: 210,
    title: "Programming with Classes",
    credits: 2,
    certificate: "Web and Computer Programming",
    description: "An introduction to object-oriented programming using a language like C#.",
    technology: ["C#"],
    completed: false
  }
];

const courseContainer = document.querySelector('#course-cards');
const creditTotal = document.querySelector('#creditTotal');
const filterButtons = document.querySelectorAll('.filter-buttons button');
const courseModal = document.querySelector('#course-details');

function displayCourseDetails(course) {
  courseModal.innerHTML = `
    <button id="closeModal" aria-label="Close course details">&times;</button>
    <h3>${course.subject} ${course.number} &mdash; ${course.title}</h3>
    <p><strong>Credits:</strong> ${course.credits}</p>
    <p><strong>Certificate:</strong> ${course.certificate}</p>
    <p><strong>Description:</strong> ${course.description}</p>
    <p><strong>Technology:</strong> ${course.technology.join(', ')}</p>
    <p><strong>Status:</strong> ${course.completed ? 'Completed' : 'In Progress'}</p>
  `;

  courseModal.showModal();

  const closeButton = courseModal.querySelector('#closeModal');
  closeButton.addEventListener('click', () => {
    courseModal.close();
  });
}

// Close the modal when clicking outside of it (on the backdrop)
courseModal.addEventListener('click', (event) => {
  const dialogRect = courseModal.getBoundingClientRect();
  const clickedInsideDialog =
    event.clientX >= dialogRect.left &&
    event.clientX <= dialogRect.right &&
    event.clientY >= dialogRect.top &&
    event.clientY <= dialogRect.bottom;

  if (!clickedInsideDialog) {
    courseModal.close();
  }
});

function displayCourses(courseList) {
  courseContainer.innerHTML = '';

  courseList.forEach(course => {
    const card = document.createElement('div');
    card.classList.add('course-card');
    if (course.completed) {
      card.classList.add('completed');
    }

    card.innerHTML = `
      <h3>${course.subject} ${course.number}</h3>
      <p class="course-title">${course.title}</p>
      <p class="course-credits">${course.credits} credits</p>
    `;

    card.addEventListener('click', () => {
      displayCourseDetails(course);
    });

    courseContainer.appendChild(card);
  });

  const total = courseList.reduce((sum, course) => sum + course.credits, 0);
  creditTotal.textContent = total;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    const filteredCourses = filter === 'all'
      ? courses
      : courses.filter(course => course.subject === filter);

    displayCourses(filteredCourses);
  });
});

displayCourses(courses);