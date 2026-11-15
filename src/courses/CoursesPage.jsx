import { AddCourseForm } from "./AddCourseForm.jsx";
import { CoursesView } from "./CoursesView.jsx";
import { useCourses } from "./useCourses.js";

export function CoursesPage() {
  const { courses, status, error, addCourse } = useCourses();

  return (
    <main>
      <CoursesView courses={courses} status={status} error={error} />
      <AddCourseForm onAdd={addCourse} />
    </main>
  );
}