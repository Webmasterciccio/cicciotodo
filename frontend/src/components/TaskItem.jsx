import { useState } from 'react'
import SubtaskChecklist from './SubtaskChecklist.jsx'

const PRIORITY_LABEL = { low: 'Bassa', medium: 'Media', high: 'Alta' }

function formatDueDate(value) {
  if (!value) return null
  const date = new Date(value)
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(task) {
  if (!task.due_date || task.status === 'done') return false
  return new Date(task.due_date) < new Date()
}

export default function TaskItem({ task, onToggleDone, onEdit, onDelete, onTaskChanged }) {
  const [expanded, setExpanded] = useState(false)
  const dueLabel = formatDueDate(task.due_date)

  return (
    <li className={`task-item ${task.status === 'done' ? 'task-item--done' : ''}`}>
      <div className="task-item__row">
        <input
          type="checkbox"
          checked={task.status === 'done'}
          onChange={() => onToggleDone(task)}
          aria-label="Completa task"
        />

        <div className="task-item__body" onClick={() => setExpanded((v) => !v)}>
          <div className="task-item__title">{task.title}</div>
          <div className="task-item__meta">
            <span className={`badge badge--priority-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
            {task.category && (
              <span className="badge badge--category" style={task.category.color ? { borderColor: task.category.color } : undefined}>
                {task.category.name}
              </span>
            )}
            {dueLabel && <span className={`badge ${isOverdue(task) ? 'badge--overdue' : ''}`}>{dueLabel}</span>}
            {task.tags.map((t) => (
              <span key={t.id} className="badge badge--tag">
                #{t.name}
              </span>
            ))}
            {task.subtasks.length > 0 && (
              <span className="badge">
                {task.subtasks.filter((s) => s.is_done).length}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        <div className="task-item__actions">
          <button className="icon-btn" onClick={() => onEdit(task)} title="Modifica">
            ✎
          </button>
          <button className="icon-btn" onClick={() => onDelete(task)} title="Elimina">
            🗑
          </button>
        </div>
      </div>

      {expanded && (
        <div className="task-item__details">
          {task.description && <p className="task-item__description">{task.description}</p>}
          <SubtaskChecklist task={task} onTaskChanged={onTaskChanged} />
        </div>
      )}
    </li>
  )
}
