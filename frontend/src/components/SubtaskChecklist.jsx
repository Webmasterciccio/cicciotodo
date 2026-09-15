import { useState } from 'react'
import { api } from '../api'

export default function SubtaskChecklist({ task, onTaskChanged }) {
  const [newTitle, setNewTitle] = useState('')

  async function refresh() {
    const fresh = await api.getTask(task.id)
    onTaskChanged(fresh)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await api.addSubtask(task.id, { title: newTitle.trim() })
    setNewTitle('')
    await refresh()
  }

  async function handleToggle(subtask) {
    await api.updateSubtask(task.id, subtask.id, { is_done: !subtask.is_done })
    await refresh()
  }

  async function handleDelete(subtask) {
    await api.deleteSubtask(task.id, subtask.id)
    await refresh()
  }

  return (
    <div className="checklist" onClick={(e) => e.stopPropagation()}>
      <ul className="checklist__items">
        {task.subtasks.map((s) => (
          <li key={s.id} className="checklist__item">
            <label>
              <input type="checkbox" checked={s.is_done} onChange={() => handleToggle(s)} />
              <span className={s.is_done ? 'checklist__item-title--done' : ''}>{s.title}</span>
            </label>
            <button className="icon-btn icon-btn--small" onClick={() => handleDelete(s)} title="Rimuovi">
              ×
            </button>
          </li>
        ))}
      </ul>
      <form className="checklist__add" onSubmit={handleAdd}>
        <input
          className="input"
          placeholder="Aggiungi sottotask…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="btn" type="submit">
          Aggiungi
        </button>
      </form>
    </div>
  )
}
