import { useState } from 'react'

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function TaskForm({ task, categories, tags, onCreateCategory, onCreateTag, onSave, onClose }) {
  const isEditing = Boolean(task?.id)

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.due_date))
  const [categoryId, setCategoryId] = useState(task?.category?.id ?? '')
  const [tagIds, setTagIds] = useState(new Set((task?.tags ?? []).map((t) => t.id)))
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function toggleTag(id) {
    setTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    const category = await onCreateCategory(newCategoryName.trim())
    setNewCategoryName('')
    setCategoryId(category.id)
  }

  async function handleAddTag() {
    if (!newTagName.trim()) return
    const tag = await onCreateTag(newTagName.trim())
    setNewTagName('')
    setTagIds((prev) => new Set(prev).add(tag.id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Il titolo è obbligatorio')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        category_id: categoryId || null,
        tag_ids: Array.from(tagIds),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Modifica task' : 'Nuovo task'}</h2>

        {error && <p className="error">{error}</p>}

        <label className="field">
          <span>Titolo</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>

        <label className="field">
          <span>Descrizione</span>
          <textarea
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Priorità</span>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </label>

          <label className="field">
            <span>Scadenza</span>
            <input
              className="input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span>Categoria</span>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Nessuna</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="inline-add">
          <input
            className="input"
            placeholder="Nuova categoria…"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button type="button" className="btn" onClick={handleAddCategory}>
            Aggiungi
          </button>
        </div>

        <div className="field">
          <span>Tag</span>
          <div className="chip-list">
            {tags.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`chip ${tagIds.has(t.id) ? 'chip--active' : ''}`}
                onClick={() => toggleTag(t.id)}
              >
                #{t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="inline-add">
          <input
            className="input"
            placeholder="Nuovo tag…"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <button type="button" className="btn" onClick={handleAddTag}>
            Aggiungi
          </button>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Annulla
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvataggio…' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  )
}
