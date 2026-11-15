function seatsText(seatsLeft) {
  if (seatsLeft === 0) return "Full";
  if (seatsLeft === 1) return "1 seat left";
  return `${seatsLeft} seats left`;
}

function creditsText(credits) {
  return credits === 1 ? "1 credit" : `${credits} credits`;
}

export function CoursesView({ courses, status, error }) {
  let list;
  if (status === "loading") {
    list = <p>Loading courses…</p>;
  } else if (status === "error") {
    list = <p>Couldn't load courses: {error}</p>;
  } else if (courses.length === 0) {
    list = <p>No courses yet.</p>;
  } else {
    list = (
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <div>
              {course.code} · {course.title}
            </div>
            <div>
              {creditsText(course.credits)} · {course.department} ·{" "}
              {seatsText(course.seatsLeft)}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <h1>Courses</h1>
      {list}
    </>
  );
}
