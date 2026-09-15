import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, onToggleDone, onEdit, onDelete, onTaskChanged }) {
  if (tasks.length === 0) {
    return <p className="muted">Nessun task da mostrare. Creane uno nuovo!</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleDone={onToggleDone}
          onEdit={onEdit}
          onDelete={onDelete}
          onTaskChanged={onTaskChanged}
        />
      ))}
    </ul>
  )
}
