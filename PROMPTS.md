# Prompt log — React Lab 2

Part of what you submit. It shows *how* you used AI: did you hand it the contract and the
rules, or type "make it work"? Fill it in **as you go**, not from memory at the end.

- Name and roll number: Prakhar Kulshrestha (MT2026070)
- AI tool and plan (e.g. ChatGPT free, Gemini, Claude free, Copilot): Claude free

**Log every prompt you send, in order — including the ones that didn't help.** Paste each
prompt in full. One exception: if you pasted CONTRACT.md's prompt 1 unchanged, write
"CONTRACT.md prompt 1, unchanged". Summarise each reply; don't paste whole files.

---

## Prompt 1 — generate

**Sent:**

```text
CONTRACT.md prompt 1, unchanged
```

**What came back:** three files in `src/courses/`: `useCourses.js`, `CoursesView.jsx` and `CoursesPage.jsx`. The hook had 7 `useState` calls (courses, status, loadError, form, submitting, submitError, fieldErrors) and one `useEffect` with an `ignore` cleanup. `CoursesView` held both the list and the whole form, built from a `FIELDS` array. No hooks from the "not yet" list. It added one thing the contract didn't ask for: "1 credit" for a single credit.
 
**Did it run?** The end-to-end `CoursesPage` tests passed against it (list loads, add appears in code order, 409 message, fieldErrors). `npm test` against this version: 33 passed / 16 failed. The failing files were `useCourses.test.jsx`, `CoursesView.test.jsx`, `AddCourseForm.test.jsx` and `fieldErrors.test.jsx`, because the code's shape did not match §4.
 
**What I did with it:** kept it as the first version to audit, and used the failing tests to plan the fix.


---

 
## Prompt 2 — the add-course form stub
 
**Why I sent it:** to get the form component the contract names.
 
**Sent:**
 
```text
Pasted the AddCourseForm.jsx stub (it throws "TODO (lab day)"), followed by: "this is the add course form"
```
 
**What came back:** `AddCourseForm.jsx` with the same props as before (`form`, `onFieldChange`, `onSubmit` and so on), plus a note that the props were a guess.
 
**What I kept, and what I rejected:** kept the file name; the props changed in prompt 8.
 
---
 
## Prompt 3 — does the View need a change?
 
**Why I sent it:** to confirm the View was finished.
 
**Sent:**
 
```text
Pasted the final CoursesView.jsx, followed by: "does this need change??"
```
 
**What came back:** no change needed. Each test in `CoursesView.test.jsx` was traced against the file. It noted that `creditsText` prints "1 credit", which goes beyond the spec.
 
**What I kept, and what I rejected:** kept the View as it was.
 
---
 
## Prompt 4 — fix the hook
 
**Why I sent it:** carries out the audit decision to move the form state out of the hook and add `addCourse`.
 
**Sent:**
 
```text
Pasted test/courses/useCourses.test.jsx and the hook, with the error:
"TypeError: result.current.addCourse is not a function (useCourses.test.jsx:132)"
```
 
**What came back:** a slimmer `useCourses` returning `{ courses, status, error, addCourse }`, where `addCourse` POSTs, inserts in code order and rethrows the `ApiError`; `AddCourseForm` now owns the four form `useState` calls and takes `onAdd`; `CoursesPage` renders `<AddCourseForm onAdd={addCourse} />`.
 
**What I kept, and what I rejected:** kept all three files.
 
---
 
## Prompt 5 — fix the accessible errors
 
**Why I sent it:** carries out the audit decision to add the aria attributes.
 
**Sent:**
 
```text
Pasted the failing test line:
"AddCourseForm — accessible field errors > a field with an error is aria-invalid, and described by its message
expect(element).toHaveAttribute("aria-invalid", "true"). Received: (nothing)"
```
 
**What came back:** `AddCourseForm.jsx` with `aria-invalid="true"` and `aria-describedby` on an input with an error, and an `id` on the message.
 
**What I kept, and what I rejected:** kept it.
 
---
 
## Prompt 6 — check the whole project
 
**Why I sent it:** to find out whether everything in the lab was finished.
 
**Sent:**
 
```text
Uploaded react-lab2.zip, followed by: "check whether i have done all the task or not"
```
 
**What came back:** `npm test` was 62 passed / 0 failed. Still to do: fill in `PROMPTS.md` and `AUDIT.md`, the optional stretch (`useDebounced.js` is a stub), and zip without `node_modules`.
 
**What I kept, and what I rejected:** acted on all of it.
 
---
 
## Afterwards
 
- How many prompts did the whole feature take? 6 prompts in total. Prompt 1 generated the code; prompts 2, 3, 4 and 5 changed it; the rest were audit and checking work.
- Which of your prompts would you write differently now, and how? I would paste `CONTRACT.md` §4 together with my own audit decisions in the first fix prompt. Sending the tests one at a time took four rounds to get to the shape §4 already describes.
- One thing the rules in prompt 1 prevented (or failed to prevent): they prevented every "not yet" hook, any library, and raw `fetch`. They did not prevent the AI putting the whole form inside the View, or keeping form state in the hook, because prompt 1 said only "one View component" and nothing about where the form or its state should live.
