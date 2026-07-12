const byuiCourse = {
  title: "Web Frontend Development I",
  code: "WDD231",
  sections: [
    { number: 1, enrolled: 88, instructor: "Brother Bingham" },
    { number: 2, enrolled: 81, instructor: "Sister Shultz" },
    { number: 3, enrolled: 95, instructor: "Sister Smith" },
  ],
  changeEnrollment(sectionNum, increase = true) {
    const section = this.sections.find((s) => s.number === sectionNum);
    if (!section) return;

    if (increase) {
      section.enrolled++;
    } else if (section.enrolled > 0) {
      section.enrolled--;
    }
  },
};

export default byuiCourse;