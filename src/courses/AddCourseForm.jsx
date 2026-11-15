import { useState } from "react";

const EMPTY_FORM = {
  code: "",
  title: "",
  department: "",
  credits: "",
  capacity: "",
  description: "",
};

const FIELDS = [
  { name: "code", label: "Code", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "department", label: "Department", type: "text" },
  { name: "credits", label: "Credits", type: "number" },
  { name: "capacity", label: "Capacity", type: "number" },
  { name: "description", label: "Description", type: "textarea" },
];

export function AddCourseForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    const courseRequest = {
      code: form.code,
      title: form.title,
      department: form.department,
      credits: Number(form.credits),
      capacity: Number(form.capacity),
      description: form.description === "" ? null : form.description,
    };

    try {
      await onAdd(courseRequest);
      setForm(EMPTY_FORM);
    } catch (error) {
      setSubmitError(error.message);
      if (error.status === 400 && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h2>Add a course</h2>
      <form onSubmit={handleSubmit}>
        {FIELDS.map(({ name, label, type }) => {
          const id = `course-${name}`;
          const errorId = `${id}-error`;
          const message = fieldErrors[name];
          const props = {
            id,
            name,
            value: form[name],
            onChange: (event) => handleChange(name, event.target.value),
            "aria-invalid": message ? "true" : undefined,
            "aria-describedby": message ? errorId : undefined,
          };
          return (
            <div key={name} className="field">
              <label htmlFor={id}>{label}</label>
              {type === "textarea" ? (
                <textarea {...props} />
              ) : (
                <input type={type} {...props} />
              )}
              {message && (
                <p id={errorId} className="field-error">
                  {message}
                </p>
              )}
            </div>
          );
        })}
        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}
        <button type="submit" disabled={submitting}>
          Add course
        </button>
      </form>
    </>
  );
}