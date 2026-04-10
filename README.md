# TaskPulse — Todo Card

A responsive todo card component built with HTML, CSS, and JavaScript.

## data-testid reference

| Attribute | Element | Description |
|---|---|---|
| `test-todo-card` | `<article>` | Root card container |
| `test-todo-title` | `<h2>` | Task title |
| `test-todo-description` | `<p>` | Task description |
| `test-todo-priority` | `<span>` | Priority badge (High / Medium / Low) |
| `test-todo-status` | `<span>` | Status badge (In Progress / Done) |
| `test-todo-due-date` | `<time>` | Formatted due date |
| `test-todo-time-remaining` | `<time>` | Live time remaining hint |
| `test-todo-complete-toggle` | `<input type="checkbox">` | Completion toggle |
| `test-todo-tags` | `<ul>` | Tags list container |
| `test-todo-tag-work` | `<li>` | Work tag |
| `test-todo-tag-urgent` | `<li>` | Urgent tag |
| `test-todo-edit-button` | `<button>` | Edit action |
| `test-todo-delete-button` | `<button>` | Delete action |

## Behaviour

- Checkbox toggles strike-through on title and flips status to "Done"
- Time remaining updates every 60 seconds
- Edit logs to console; Delete fires an alert
- Fully keyboard navigable: Tab → checkbox → Edit → Delete
