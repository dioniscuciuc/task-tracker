function TaskComposer({
  showComposer,
  onClose,
  onSubmit,
  onChange,
  draft,
  projects,
  boardColumns,
}) {
  if (!showComposer) {
    return null
  }

  return (
    <div className="composer-overlay" onClick={onClose}>
      <div className="composer-panel panel" onClick={(event) => event.stopPropagation()}>
        <div className="composer-header">
          <div>
            <p className="eyebrow">Capture</p>
            <h2>New task</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="composer-form">
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={draft.title}
              onChange={onChange}
              placeholder="Write a task that matters"
              required
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Project</span>
              <select name="project" value={draft.project} onChange={onChange}>
                {projects.map((projectName) => (
                  <option key={projectName} value={projectName}>
                    {projectName}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select name="priority" value={draft.priority} onChange={onChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Lane</span>
              <select name="status" value={draft.status} onChange={onChange}>
                {boardColumns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Due date</span>
              <input type="date" name="date" value={draft.date} onChange={onChange} />
            </label>
          </div>

          <label className="field">
            <span>Notes</span>
            <textarea
              name="notes"
              value={draft.notes}
              onChange={onChange}
              rows="4"
              placeholder="Add context, checklist, or a quick reminder"
            />
          </label>

          <div className="composer-footer">
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskComposer
