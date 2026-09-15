export default function Sidebar({
  categories,
  tags,
  filters,
  onFiltersChange,
  showDone,
  onShowDoneChange,
  onNewTask,
}) {
  function setFilter(key, value) {
    onFiltersChange((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value }))
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">CiccioTodo</div>

      <button className="btn btn--primary btn--block" onClick={onNewTask}>
        + Nuovo task
      </button>

      <input
        className="input"
        placeholder="Cerca…"
        value={filters.search}
        onChange={(e) => onFiltersChange((prev) => ({ ...prev, search: e.target.value }))}
      />

      <section className="sidebar__section">
        <h3>Stato</h3>
        <div className="chip-list">
          {[
            { value: '', label: 'Tutti' },
            { value: 'todo', label: 'Da fare' },
            { value: 'done', label: 'Completati' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`chip ${filters.status === opt.value ? 'chip--active' : ''}`}
              onClick={() => onFiltersChange((prev) => ({ ...prev, status: opt.value }))}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="checkbox">
          <input type="checkbox" checked={showDone} onChange={(e) => onShowDoneChange(e.target.checked)} />
          Mostra i completati in lista
        </label>
      </section>

      <section className="sidebar__section">
        <h3>Categorie</h3>
        <div className="chip-list chip-list--vertical">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${filters.category_id === c.id ? 'chip--active' : ''}`}
              style={c.color ? { borderColor: c.color } : undefined}
              onClick={() => setFilter('category_id', c.id)}
            >
              {c.name}
            </button>
          ))}
          {categories.length === 0 && <p className="muted muted--small">Nessuna categoria ancora</p>}
        </div>
      </section>

      <section className="sidebar__section">
        <h3>Tag</h3>
        <div className="chip-list">
          {tags.map((t) => (
            <button
              key={t.id}
              className={`chip ${filters.tag_id === t.id ? 'chip--active' : ''}`}
              onClick={() => setFilter('tag_id', t.id)}
            >
              #{t.name}
            </button>
          ))}
          {tags.length === 0 && <p className="muted muted--small">Nessun tag ancora</p>}
        </div>
      </section>
    </aside>
  )
}
