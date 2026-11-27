import { useState, useEffect } from "react";
import "./App.css";

/* ---------- Small inline icons ---------- */

const Svg = ({ children, size = 24, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

const IconSearch = () => (
  <Svg size={20} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);

const IconTotal = () => (
  <Svg size={32}>
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconClock = () => (
  <Svg size={32}>
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="M12 6.5V12l3.5 2" stroke="#761d07" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconAlert = () => (
  <Svg size={32}>
    <path d="M12 2.5L22.5 21h-21L12 2.5z" fill="currentColor" strokeLinejoin="round" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 9.5v5" stroke="#f3d20e" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="17.6" r="1.2" fill="#f3d20e" />
  </Svg>
);

const IconDone = () => (
  <Svg size={32}>
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#6e623f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPencil = () => (
  <Svg size={20} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);

const IconTrash = () => (
  <Svg size={20} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);

/* ---------- Helpers ---------- */

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(String(value).slice(0, 10) + "T00:00:00");
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(t, today) {
  return !t.done && !!t.due_date && String(t.due_date).slice(0, 10) < today;
}

/* ---------- App ---------- */

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), priority: priority, due_date: dueDate }),
    })
      .then((res) => res.json())
      .then((task) => {
        setTasks((prev) => [task, ...prev]);
        setTitle("");
        setPriority("medium");
        setDueDate("");
      });
  }

  function toggleDone(t) {
    fetch("/api/tasks/" + t.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t.title, priority: t.priority, due_date: t.due_date, done: !t.done }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      });
  }

  function saveEdit(t) {
    if (!editTitle.trim()) return;
    fetch("/api/tasks/" + t.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), priority: t.priority, due_date: t.due_date, done: t.done }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        setEditingId(null);
      });
  }

  function deleteTask(id) {
    fetch("/api/tasks/" + id, { method: "DELETE" }).then(() => {
      setTasks((prev) => prev.filter((x) => x.id !== id));
    });
  }

  function viewAll() {
    setFilter("all");
    setSearch("");
  }

  const today = todayString();

  let shown = tasks;
  if (filter === "active") shown = shown.filter((t) => !t.done);
  if (filter === "done") shown = shown.filter((t) => t.done);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    shown = shown.filter((t) => t.title.toLowerCase().includes(q));
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const overdue = tasks.filter((t) => isOverdue(t, today)).length;
  const inProgress = total - completed - overdue;
  const pending = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Donut geometry
  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Task Tracker</h1>
          <p className="app-subtitle">Stay on top of your work, every day.</p>
        </div>
        <label className="search">
          <IconSearch />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />
        </label>
      </header>

      <section className="summary" aria-label="Task summary">
        <div className="summary-card total">
          <span className="summary-label">Total Tasks</span>
          <div className="summary-row">
            <span className="summary-value">{total}</span>
            <span className="summary-icon"><IconTotal /></span>
          </div>
        </div>
        <div className="summary-card progress">
          <span className="summary-label">In Progress</span>
          <div className="summary-row">
            <span className="summary-value">{inProgress}</span>
            <span className="summary-icon"><IconClock /></span>
          </div>
        </div>
        <div className="summary-card overdue">
          <span className="summary-label">Overdue</span>
          <div className="summary-row">
            <span className="summary-value">{overdue}</span>
            <span className="summary-icon"><IconAlert /></span>
          </div>
        </div>
        <div className="summary-card completed">
          <span className="summary-label">Completed</span>
          <div className="summary-row">
            <span className="summary-value">{completed}</span>
            <span className="summary-icon"><IconDone /></span>
          </div>
        </div>
      </section>

      <div className="main">
        <section className="panel" aria-labelledby="tasks-heading">
          <div className="panel-head">
            <h2 className="panel-title" id="tasks-heading">Your Tasks</h2>
            <button className="link-button" onClick={viewAll}>View all →</button>
          </div>

          <form className="add-form" onSubmit={addTask}>
            <input
              className="field title-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task"
              aria-label="Task title"
            />
            <select
              className="field"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              className="field"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Due date"
            />
            <button className="btn-primary" type="submit">Add</button>
          </form>

          <div className="filters" role="group" aria-label="Filter tasks">
            {["all", "active", "done"].map((f) => (
              <button
                key={f}
                className={"pill" + (filter === f ? " active" : "")}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th className="col-check"><span className="sr-only">Done</span></th>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!t.done}
                        onChange={() => toggleDone(t)}
                        aria-label={"Mark " + t.title + " as done"}
                      />
                    </td>
                    <td>
                      {editingId === t.id ? (
                        <div className="edit-row">
                          <input
                            className="field"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            aria-label="Edit task title"
                            autoFocus
                          />
                          <button className="btn-small save" onClick={() => saveEdit(t)}>Save</button>
                          <button className="btn-small" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <span className={"task-title" + (t.done ? " is-done" : "")}>{t.title}</span>
                      )}
                    </td>
                    <td>
                      <span className={"badge " + t.priority}>{t.priority}</span>
                    </td>
                    <td className={"due" + (isOverdue(t, today) ? " is-overdue" : "")}>
                      {formatDate(t.due_date)}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-button"
                          onClick={() => { setEditingId(t.id); setEditTitle(t.title); }}
                          aria-label={"Edit " + t.title}
                        >
                          <IconPencil />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => deleteTask(t.id)}
                          aria-label={"Delete " + t.title}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && <p className="empty">No tasks to show. Add one above.</p>}
          </div>
        </section>

        <aside className="panel stats" aria-labelledby="stats-heading">
          <div className="panel-head">
            <h2 className="panel-title" id="stats-heading">Quick Stats</h2>
          </div>

          <div className="donut">
            <svg viewBox="0 0 180 180" role="img" aria-label={"Completion rate " + rate + " percent"}>
              <circle cx="90" cy="90" r={R} fill="none" stroke="#e7bc7f" strokeWidth="22" />
              <circle
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke="#6e623f"
                strokeWidth="22"
                strokeDasharray={C}
                strokeDashoffset={C - (C * rate) / 100}
              />
            </svg>
            <div className="donut-center">
              <span className="donut-value">{rate}%</span>
              <span className="donut-label">Completion<br />Rate</span>
            </div>
          </div>

          <ul className="legend">
            <li>
              <span className="dot completed" />
              Completed
              <span className="count">{completed}</span>
            </li>
            <li>
              <span className="dot pending" />
              Pending
              <span className="count">{pending}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
