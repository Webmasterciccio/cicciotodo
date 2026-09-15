import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import Sidebar from './components/Sidebar.jsx'
import TaskList from './components/TaskList.jsx'
import TaskForm from './components/TaskForm.jsx'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({ status: '', category_id: '', tag_id: '', search: '' })
  const [editingTask, setEditingTask] = useState(null) // null = chiuso, {} = nuovo, {...} = modifica
  const [showDone, setShowDone] = useState(true)

  async function reloadTasks() {
    const data = await api.listTasks(filters)
    setTasks(data)
  }

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [t, c, tg] = await Promise.all([api.listTasks(filters), api.listCategories(), api.listTags()])
      setTasks(t)
      setCategories(c)
      setTags(tg)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loading) reloadTasks().catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const visibleTasks = useMemo(
    () => (showDone ? tasks : tasks.filter((t) => t.status !== 'done')),
    [tasks, showDone],
  )

  async function handleToggleDone(task) {
    const updated = await api.updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleDelete(task) {
    await api.deleteTask(task.id)
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
  }

  async function handleSave(data) {
    if (editingTask?.id) {
      const updated = await api.updateTask(editingTask.id, data)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } else {
      const created = await api.createTask(data)
      setTasks((prev) => [created, ...prev])
    }
    setEditingTask(null)
  }

  async function handleTaskChanged(updated) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleCreateCategory(name) {
    const category = await api.createCategory({ name })
    setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)))
    return category
  }

  async function handleCreateTag(name) {
    const tag = await api.createTag({ name })
    setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
    return tag
  }

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        tags={tags}
        filters={filters}
        onFiltersChange={setFilters}
        showDone={showDone}
        onShowDoneChange={setShowDone}
        onNewTask={() => setEditingTask({})}
      />

      <main className="main">
        <header className="main__header">
          <h1>CiccioTodo</h1>
          <button className="btn btn--primary" onClick={() => setEditingTask({})}>
            + Nuovo task
          </button>
        </header>

        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Caricamento…</p>
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggleDone={handleToggleDone}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onTaskChanged={handleTaskChanged}
          />
        )}
      </main>

      {editingTask !== null && (
        <TaskForm
          task={editingTask}
          categories={categories}
          tags={tags}
          onCreateCategory={handleCreateCategory}
          onCreateTag={handleCreateTag}
          onSave={handleSave}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
