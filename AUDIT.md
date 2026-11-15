# Audit — React Lab 2

Part of what you submit. Fill in sections 0–4 **before** you ask the AI to change anything:
deciding what's wrong is your job, not the AI's. The sheet you audit against is "The Shape
of a Good React Slice" — section 08 of the lab doc.

Point at code as `file:line`, e.g. `CoursesPage.jsx:14`.

---

## 0. What came back

| File the AI gave you | What's in it (components, hooks) | Lines |
| --- | --- | --- |
| `src/courses/useCourses.js` | `useCourses` hook (7 `useState`, 1 `useEffect`), `byCode` sort helper, `EMPTY_FORM` | 93 |
| `src/courses/CoursesView.jsx` | `CoursesView` (list **and** the whole form), `FIELDS`, `seatsText`, `creditsText` | 101 |
| `src/courses/CoursesPage.jsx` | `CoursesPage` (calls the hook, passes 9 props to the view) | 30 |
 
- **Does it run?** Yes, for what the spec describes. The end-to-end `CoursesPage` tests pass against this version: the list loads, a valid add appears in code order and the form clears, a duplicate code shows the 409 message, and bad input shows "Validation failed" with a reason per field. (Run `npm run dev` yourself to confirm in the browser.)
- **Requests in the Network tab:** on page load, 1 GET `/api/courses` (2 in dev under StrictMode, because the effect runs twice; the `ignore` flag discards the first answer, not the request). Per add: 1 POST and no GET (`useCourses.js:70` merges the 201 body into the list).
- **`npm test` before any fix:** 33 passed / 16 failed (49 tests ran). Four test files failed:
  - `test/courses/useCourses.test.jsx`: 8 of 10 fail. The hook returns `loadError`, `submit`, `form` and so on, not `{ courses, status, error, addCourse }` (`useCourses.js:82–91`), so `error` and `addCourse` are missing.
  - `test/courses/CoursesView.test.jsx`: all 8 fail. The View needs `form`, `fieldErrors` and others as props and reads `loadError`, not `error` (`CoursesView.jsx:20–29`), so it crashes when rendered with only `courses`, `status`, `error`.
  - `test/courses/AddCourseForm.test.jsx` and `test/courses/fieldErrors.test.jsx`: cannot load, because `AddCourseForm.jsx` does not exist.


## 1. Part A — walk the allowed list

Is each element present, and in the right place?

| Element (the sheet, Part A) | Where it is in the AI's code (`file:line`, or "missing") | Right place? If not, where should it be? |
| --- | --- | --- |
| One View component that only renders | `CoursesView.jsx:20–101` | Partly. It renders, but it also contains the whole form (`:55–99`), with a submit handler (`:31–34`). The form should be its own component, `AddCourseForm`, so the View shows only the heading and list. |
| Fetch + logic in a separate hook or module | `useCourses.js:19–93` | Yes, but the hook also holds the form's typing state and submit logic. Only the fetch and the add belong here. |
| `useState` for the course list, at the right level | `useCourses.js:20` | Yes. Load and add both change the list, so it lives in the hook. |
| `useState` for the form's inputs, at the right level | `useCourses.js:24` | No. Only the form uses it. It should be in `AddCourseForm`. |
| `useEffect` for the initial fetch only (with a cleanup) | `useCourses.js:29–45` | Yes. `[]` deps, and the cleanup sets `ignore`. |
| Props down, callbacks up (the form raises "add this course") | `CoursesPage.jsx:18–28` | No. The callback is `onSubmit()` with no argument. The hook reads its own `form` state instead of the form raising `onAdd(courseRequest)`. |
| `.map` to render the list, with a stable `key` | `CoursesView.jsx:46–47` (`key={course.id}`); `:68`, `:77` (`key={name}`) | Yes. No `key={index}`. |
| Loading / error / empty states, from one `status` | `CoursesView.jsx:37–43`, `useCourses.js:21` | Mostly. `status` covers loading / error / ready, but the message is stored as `loadError` (`:22`, initial `""`), not `error` (`null` unless it failed). |


## 2. Part B — scan for "not yet"

Search the files (VS Code: Ctrl/Cmd+Shift+F) for each one.

| Not yet | Found? (`file:line`) | What it does in *this* slice | Cut, or keep — and why |
| --- | --- | --- | --- |
| `useMemo` | No | n/a | n/a |
| `useCallback` | No | n/a | n/a |
| `useReducer` | No | n/a | n/a |
| `useRef` | No | n/a | n/a |
| Context (`createContext`, `useContext`) | No | n/a | n/a |
| A data-fetching library, `axios`, or raw `fetch` instead of `apiFetch` | No. `apiFetch` is used at `useCourses.js:31` and `:66`. | n/a | n/a |
| TypeScript | No | n/a | n/a |
| Anything else nobody taught you | `FIELDS` config array + `.map` to build the six inputs (`CoursesView.jsx:1–8`, `:68`), and spread props (`:70–75`, `:80`, `:82`). | Builds the form from data instead of six written-out inputs. | Keep. It is plain JS, it has a stable `key`, and it avoids six near-identical blocks. Be ready to explain the spread. |


## 3. The rule — every hook and every component split

One row for **each** `useState`, `useEffect` and custom hook call, and for **each**
component. Say what it does *in this slice*. "The AI added it" and "just in case" are not
answers — if you can't name its job, the decision is "cut".

| Hook call or component (`file:line`) | What earns it here? (one sentence) | Keep / cut / move (to where) |
| --- | --- | --- |
| `useState` courses (`useCourses.js:20`) | Holds the list shown in the `<ul>` and receives the new course after an add. | Keep |
| `useState` status (`useCourses.js:21`) | Drives loading / error / ready from one field. | Keep |
| `useState` loadError (`useCourses.js:22`) | Holds the message for "Couldn't load courses: …". | Keep, but rename to `error` and start it as `null`, as the contract requires. |
| `useState` form (`useCourses.js:24`) | Holds what's typed so a failed add keeps it. | **Move** to `AddCourseForm`. |
| `useState` submitting (`useCourses.js:25`) | Disables the button until the server answers. | **Move** to `AddCourseForm`. |
| `useState` submitError (`useCourses.js:26`) | The message above the button. | **Move** to `AddCourseForm`. |
| `useState` fieldErrors (`useCourses.js:27`) | The per-input messages for a 400. | **Move** to `AddCourseForm`. |
| `useEffect` (`useCourses.js:29`) | The one-time GET of the list. | Keep |
| `useCourses` (`useCourses.js:19`) | Separates fetch and logic from rendering, as the rules require. | Keep, but slim it to `{ courses, status, error, addCourse }`. |
| `CoursesView` (`CoursesView.jsx:20`) | Renders the heading and the three list states. | Keep, but remove the form. |
| The form inside `CoursesView` (`CoursesView.jsx:55–99`) | Renders and submits the add form. | **Move** to a new component, `AddCourseForm`. |
| `CoursesPage` (`CoursesPage.jsx:4`) | Required export; connects the hook to the view. | Keep, but render `<AddCourseForm onAdd={addCourse} />`. |


## 4. Decisions — before any fix prompt

- **I will cut:** nothing forbidden is present. I will cut the `setField` and `submit` functions and the `form`, `submitting`, `submitError` and `fieldErrors` values from the hook's return, because the form will own them.
- **I will move (from → to):**
  - the form markup from `CoursesView` → a new `AddCourseForm.jsx`;
  - the form's four `useState` calls from `useCourses` → `AddCourseForm`;
  - building the `courseRequest` (`Number(...)`, empty description → `null`) from the hook → the form, which then calls `onAdd(courseRequest)`.
- **I will add (missing from the AI's version):**
  - `addCourse(courseRequest)` in the hook. It POSTs, inserts the 201 body in code order, returns the created course, and lets the `ApiError` propagate so the form can show it.
  - `aria-invalid` and `aria-describedby` on an input that has a field error, with an `id` on the message.
  - `error` as `null` unless the load failed.
- **Other smells I found:**
  - `Number("")` is `0` (`useCourses.js:60–61`), so an empty Credits or Capacity is sent as `0` instead of what was typed.
  - If the user adds a course while the list is still loading, the later GET answer overwrites it (`useCourses.js:34`).
  - If the list failed to load but an add succeeds, `status` stays `"error"` and the new course never shows.
  - `creditsText` (`CoursesView.jsx:16–18`) prints "1 credit", which goes beyond the spec.
  - Clean: no swallowed errors, no reload after add, no browser validation, no `key={index}`.



## 5. Strip check (section 14 of the doc)

For each "not yet" item you removed — one at a time:

| Removed | `npm test` after | The app after (loads / adds / shows errors) |
| --- | --- | --- |
| Nothing to remove | n/a | n/a |
 
The AI used no "not yet" items. The rule in prompt 1 that I think prevented it is "Use only useState and useEffect. Do not use useMemo, useCallback, useReducer, useRef, or context." The "No new packages" and "apiFetch" notes likely stopped it reaching for a library or raw `fetch`.



## 6. Before / after

|  | Before (the AI's first version) | After (yours) |
| --- | --- | --- |
| Files and components | 3 files: 2 components (`CoursesView`, `CoursesPage`) and 1 hook | 4 files: 3 components (`CoursesView`, `AddCourseForm`, `CoursesPage`) and 1 hook |
| `useState` calls (and where) | 7, all in `useCourses` | 7: 3 in `useCourses` (courses, status, error) and 4 in `AddCourseForm` (form, submitting, submitError, fieldErrors) |
| `useEffect` calls | 1 | 1 |
| "Not yet" items | 0 | 0 |
| Requests: on load / per add | 1 (2 in dev StrictMode) / 1 | 1 (2 in dev StrictMode) / 1 |
| `npm test` | 33 passed / 16 failed (4 files failing) | 62 passed / 0 failed (`npm test`, 9 files) |



## 7. Two sentences

- **One thing the AI got right that you might not have thought of:** the `ignore` flag in the effect cleanup, and merging the created course into the list with a re-sort instead of refetching it.
- **One thing you will never accept from an AI without checking again:** a version that "works" in the browser but ignores the agreed shape, since the first draft passed the end-to-end page test and still failed 16 other tests, so I will always run the tests and read the contract, not just click through the app.
