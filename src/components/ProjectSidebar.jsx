function ProjectSidebar({
  projects,
  selectedProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  projectCounts,
  newProjectName,
  onNewProjectNameChange,
}) {
  return (
    <aside className="sidebar">
      <section className="panel sidebar-panel">
        <p className="panel-label">Projects</p>
        <div className="project-list">
          <button
            type="button"
            className={`project-pill ${selectedProject === 'all' ? 'active' : ''}`}
            onClick={() => onProjectSelect('all')}
          >
            <span>All work</span>
            <strong>{projectCounts.total ?? 0}</strong>
          </button>

          {projects.map((projectName) => (
            <div
              key={projectName}
              className={`project-pill ${selectedProject === projectName ? 'active' : ''}`}
            >
              <button
                type="button"
                className="project-pill-button"
                onClick={() => onProjectSelect(projectName)}
              >
                <span>{projectName}</span>
                <strong>{projectCounts[projectName] ?? 0}</strong>
              </button>

              <button
                type="button"
                className="project-delete"
                onClick={() => onProjectDelete(projectName)}
                aria-label={`Delete project ${projectName}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel sidebar-panel">
        <p className="panel-label">Add project</p>
        <form onSubmit={onProjectCreate} className="project-form">
          <input
            type="text"
            value={newProjectName}
            onChange={(event) => onNewProjectNameChange(event.target.value)}
            placeholder="New project name"
          />
          <button type="submit" className="secondary-button">
            Save
          </button>
        </form>
      </section>
    </aside>
  )
}

export default ProjectSidebar
