import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Circle, ClipboardList, LoaderCircle, Plus, RefreshCw, Trash2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try { message = (await response.json()).message || message; } catch {}
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setTasks(await request('/api/tasks')); }
    catch (err) { setError(`${err.message}. Check that the backend is running and VITE_API_URL is correct.`); }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const counts = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
  }), [tasks]);

  const visibleTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true); setError('');
    try {
      const task = await request('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) });
      setTasks(current => [task, ...current]);
      setTitle('');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function toggleTask(id) {
    setError('');
    try {
      const updated = await request(`/api/tasks/${id}`, { method: 'PATCH' });
      setTasks(current => current.map(task => task.id === id ? updated : task));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    setError('');
    try {
      await request(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(current => current.filter(task => task.id !== id));
    } catch (err) { setError(err.message); }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="TaskFlow home">
          <span className="brand-icon"><ClipboardList size={21} /></span>
          <span>taskflow<span className="brand-dot">.</span></span>
        </a>
        <span className="api-status"><span className="status-dot" /> Full-stack demo</span>
      </header>

      <section className="hero">
        <div className="eyebrow">YOUR DAY, ORGANIZED</div>
        <h1>Make space for<br /><span>what matters.</span></h1>
        <p>A simple place to collect your tasks, keep your momentum, and celebrate progress.</p>
      </section>

      <section className="stats" aria-label="Task summary">
        <div className="stat-card"><span className="stat-label">All tasks</span><strong>{counts.total.toString().padStart(2, '0')}</strong></div>
        <div className="stat-card"><span className="stat-label">In progress</span><strong>{counts.active.toString().padStart(2, '0')}</strong></div>
        <div className="stat-card"><span className="stat-label">Completed</span><strong>{counts.completed.toString().padStart(2, '0')}</strong></div>
      </section>

      <section className="task-panel">
        <div className="panel-heading">
          <div><h2>Your tasks</h2><p>Small steps add up.</p></div>
          <button className="icon-button" onClick={loadTasks} title="Refresh tasks" aria-label="Refresh tasks"><RefreshCw size={17} /></button>
        </div>

        <form className="add-form" onSubmit={addTask}>
          <input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} placeholder="What do you need to get done?" aria-label="New task" />
          <button className="add-button" type="submit" disabled={!title.trim() || saving}>
            {saving ? <LoaderCircle className="spin" size={17} /> : <Plus size={18} />} Add task
          </button>
        </form>

        {error && <div className="error-message" role="alert">{error}</div>}

        <div className="filters" role="tablist" aria-label="Filter tasks">
          {['all', 'active', 'completed'].map(item => <button key={item} className={filter === item ? 'filter active-filter' : 'filter'} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item}>{item[0].toUpperCase() + item.slice(1)}</button>)}
          <span className="task-count">{visibleTasks.length} shown</span>
        </div>

        <div className="task-list">
          {loading ? <div className="empty-state"><LoaderCircle className="spin" size={24} /><p>Loading your tasks…</p></div> :
            visibleTasks.length === 0 ? <div className="empty-state"><ClipboardList size={27} /><p>No tasks here yet.</p><span>Add a task above to get started.</span></div> :
            visibleTasks.map(task => (
              <article className={`task-row ${task.completed ? 'task-done' : ''}`} key={task.id}>
                <button className="check-button" onClick={() => toggleTask(task.id)} aria-label={task.completed ? 'Mark as incomplete' : 'Mark as completed'}>{task.completed ? <Check size={17} /> : <Circle size={19} />}</button>
                <div className="task-copy"><span>{task.title}</span><small>{task.completed ? 'Completed' : 'In progress'}</small></div>
                <button className="delete-button" onClick={() => deleteTask(task.id)} title="Delete task" aria-label={`Delete ${task.title}`}><Trash2 size={17} /></button>
              </article>
            ))
          }
        </div>
      </section>
      <footer><span>Built with React + Express</span><span>One task at a time <span className="brand-dot">✦</span></span></footer>
    </main>
  );
}
