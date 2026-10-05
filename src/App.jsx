import './App.css'
import AuthScreen from './components/AuthScreen'
import BoardColumn from './components/BoardColumn'
import ProjectSidebar from './components/ProjectSidebar'
import TaskComposer from './components/TaskComposer'
import { projectClassMap } from './data/kanbanData'
import useKanbanBoard from './hooks/useKanbanBoard'

function App() {
  const {
    boardColumns: columns,
    projects,
    selectedProject,
    setSelectedProject,
    showComposer,
    setShowComposer,
    draggedTaskId,
    newProjectName,
    setNewProjectName,
    draft,
    visibleTasks,
    summary,
    projectCounts,
    authMode,
    setAuthMode,
    authForm,
    authError,
    isAuthLoading,
    user,
    token,
    handleAuthInputChange,
    handleAuthSubmit,
    logout,
    handleDraftChange,
    handleCreateTask,
    moveTask,
    deleteTask,
    clearDone,
    handleProjectSubmit,
    deleteProject,
    setDraggedTaskId,
  } = useKanbanBoard()

  if (!token || !user) {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        form={authForm}
        onChange={handleAuthInputChange}
        onSubmit={handleAuthSubmit}
        loading={isAuthLoading}
        error={authError}
      />
    )
  }

  const projectSummary = {
    total: visibleTasks.length,
    ...summary,
  }

  return (
    <div className="app-shell">
      <header className="top-bar panel">
        <div className="brand-block">
          <div className="brand-mark">L</div>
          <div>
            <p className="eyebrow">Personal operations</p>
            <h1>Lattice Board</h1>
          </div>
        </div>

        <div className="action-bar">
          <span className="user-badge">{user.email}</span>
          <button type="button" className="ghost-button" onClick={logout}>
            Log out
          </button>
          <button type="button" className="ghost-button" onClick={clearDone}>
            Clear done
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowComposer(true)}
          >
            + New task
          </button>
        </div>
      </header>

      <div className="main-grid">
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          onProjectCreate={handleProjectSubmit}
          onProjectDelete={deleteProject}
          onNewProjectNameChange={setNewProjectName}
          newProjectName={newProjectName}
          projectCounts={projectCounts}
        />

        <main className="board-wrap">
          <section className="stats-row">
            <article className="metric-card panel">
              <span>Visible tasks</span>
              <strong>{projectSummary.total}</strong>
            </article>
            <article className="metric-card panel">
              <span>In motion</span>
              <strong>{projectSummary.active}</strong>
            </article>
            <article className="metric-card panel">
              <span>Done rate</span>
              <strong>{projectSummary.completion}%</strong>
            </article>
          </section>

          <section className="board">
            {columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={visibleTasks.filter((task) => task.status === column.id)}
                projectClassMap={projectClassMap}
                onMoveTask={moveTask}
                onDeleteTask={deleteTask}
                onDragStart={setDraggedTaskId}
                draggedTaskId={draggedTaskId}
                boardColumns={columns}
              />
            ))}
          </section>
        </main>
      </div>

      <TaskComposer
        showComposer={showComposer}
        onClose={() => setShowComposer(false)}
        onSubmit={handleCreateTask}
        onChange={handleDraftChange}
        draft={draft}
        projects={projects}
        boardColumns={columns}
      />
    </div>
  )
}

export default App
