function formatDate(value) {
  if (!value) {
    return 'No due date'
  }

  const date = new Date(value)
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function BoardColumn({
  column,
  tasks,
  projectClassMap,
  onMoveTask,
  onDeleteTask,
  onDragStart,
  draggedTaskId,
  boardColumns,
}) {
  return (
    <div
      key={column.id}
      className={`lane panel ${column.tone}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onMoveTask(draggedTaskId, column.id)}
    >
      <div className="lane-header">
        <div className="lane-title-wrap">
          <span className={`lane-dot ${column.tone}`} />
          <h2>{column.title}</h2>
        </div>
        <span className="lane-count">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? <div className="empty-slot">Drop a task here</div> : null}

        {tasks.map((task) => (
          <article
            key={task.id}
            className="task-card"
            draggable
            onDragStart={() => onDragStart(task.id)}
          >
            <div className="task-top-row">
              <span
                className={`project-badge ${projectClassMap[task.project] || 'project-default'}`}
              >
                {task.project}
              </span>
              <button
                type="button"
                className="delete-button"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
              >
                ×
              </button>
            </div>

            <h3>{task.title}</h3>
            {task.notes ? <p>{task.notes}</p> : null}

            <div className="task-meta">
              <span className={`priority-tag priority-${task.priority}`}>{task.priority}</span>
              {task.date ? <span>{formatDate(task.date)}</span> : null}
            </div>

            <div className="task-actions">
              {column.id !== 'backlog' ? (
                <button
                  type="button"
                  className="small-button"
                  onClick={() =>
                    onMoveTask(
                      task.id,
                      boardColumns[
                        Math.max(
                          0,
                          boardColumns.findIndex((entry) => entry.id === column.id) - 1,
                        )
                      ].id,
                    )
                  }
                >
                  ← Back
                </button>
              ) : null}

              {column.id !== 'done' ? (
                <button
                  type="button"
                  className="small-button"
                  onClick={() =>
                    onMoveTask(
                      task.id,
                      boardColumns[
                        Math.min(
                          boardColumns.length - 1,
                          boardColumns.findIndex((entry) => entry.id === column.id) + 1,
                        )
                      ].id,
                    )
                  }
                >
                  Next →
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default BoardColumn
