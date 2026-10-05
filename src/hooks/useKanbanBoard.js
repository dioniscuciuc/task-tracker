import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { boardColumns, normalisedProjects } from '../data/kanbanData'

const createEmptyDraft = (project = 'Personal') => ({
  title: '',
  project,
  priority: 'medium',
  status: 'backlog',
  date: '',
  notes: '',
})

export default function useKanbanBoard() {
  const [token, setToken] = useState(() => localStorage.getItem('lattice-board-token') || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lattice-board-user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [projects, setProjects] = useState(normalisedProjects)
  const [tasks, setTasks] = useState([])
  const [selectedProject, setSelectedProject] = useState('all')
  const [showComposer, setShowComposer] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [draft, setDraft] = useState(() => createEmptyDraft())
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const syncSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('lattice-board-token', nextToken)
    } else {
      localStorage.removeItem('lattice-board-token')
    }

    if (nextUser) {
      localStorage.setItem('lattice-board-user', JSON.stringify(nextUser))
    } else {
      localStorage.removeItem('lattice-board-user')
    }

    setToken(nextToken)
    setUser(nextUser)
  }

  const fetchBoardData = async () => {
    if (!token) {
      return
    }

    try {
      const [projectList, taskList] = await Promise.all([api.getProjects(), api.getTasks()])
      const nextProjects = projectList.length ? projectList : ['Personal']
      setProjects(nextProjects)
      setTasks(taskList)
      setDraft((currentDraft) => ({
        ...currentDraft,
        project: currentDraft.project && nextProjects.includes(currentDraft.project)
          ? currentDraft.project
          : nextProjects[0] || 'Personal',
      }))
    } catch (error) {
      setAuthError(error.message)
      logout()
    }
  }

  useEffect(() => {
    if (!token) {
      setTasks([])
      setProjects(normalisedProjects)
      setSelectedProject('all')
      setDraft(createEmptyDraft())
      return
    }

    fetchBoardData()
  }, [token])

  const visibleTasks = useMemo(() => {
    if (selectedProject === 'all') {
      return tasks
    }

    return tasks.filter((task) => task.project === selectedProject)
  }, [selectedProject, tasks])

  const summary = useMemo(() => {
    const total = visibleTasks.length
    const done = visibleTasks.filter((task) => task.status === 'done').length
    const active = visibleTasks.filter((task) => ['today', 'doing'].includes(task.status)).length

    return {
      total,
      done,
      active,
      completion: total ? Math.round((done / total) * 100) : 0,
    }
  }, [visibleTasks])

  const projectCounts = useMemo(() => {
    const counts = projects.reduce((countMap, projectName) => {
      countMap[projectName] = tasks.filter((task) => task.project === projectName).length
      return countMap
    }, {})

    return {
      ...counts,
      total: tasks.length,
    }
  }, [projects, tasks])

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target
    setAuthForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setIsAuthLoading(true)

    try {
      const apiCall = authMode === 'register' ? api.register : api.login
      const result = await apiCall(authForm.email, authForm.password)
      syncSession(result.token, result.user)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const logout = () => {
    syncSession('', null)
    setSelectedProject('all')
    setShowComposer(false)
    setNewProjectName('')
    setAuthMode('login')
  }

  const handleDraftChange = (event) => {
    const { name, value } = event.target
    setDraft((currentDraft) => ({
      ...currentDraft,
      [name]: value,
    }))
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()

    if (!draft.title.trim()) {
      return
    }

    try {
      await api.createTask({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
        title: draft.title.trim(),
        project: draft.project || 'Personal',
        status: draft.status,
        priority: draft.priority,
        date: draft.date,
        notes: draft.notes.trim(),
      })

      setDraft(createEmptyDraft(draft.project || 'Personal'))
      setShowComposer(false)
      await fetchBoardData()
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const moveTask = async (taskId, nextStatus) => {
    if (!taskId || !nextStatus) {
      return
    }

    try {
      await api.updateTask(taskId, { status: nextStatus })
      setDraggedTaskId(null)
      await fetchBoardData()
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId)
      await fetchBoardData()
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const clearDone = async () => {
    const doneTasks = tasks.filter((task) => task.status === 'done')

    if (!doneTasks.length) {
      return
    }

    try {
      await Promise.all(doneTasks.map((task) => api.deleteTask(task.id)))
      await fetchBoardData()
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()

    const cleanedName = newProjectName.trim()

    if (!cleanedName) {
      return
    }

    try {
      await api.createProject(cleanedName)
      setProjects((currentProjects) => [...currentProjects, cleanedName])
      setDraft((currentDraft) => ({
        ...currentDraft,
        project: cleanedName,
      }))
      setSelectedProject(cleanedName)
      setNewProjectName('')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const deleteProject = async (projectName) => {
    try {
      const fallbackProject = projects.find((project) => project !== projectName) || 'Personal'
      await api.deleteProject(projectName)
      setProjects((currentProjects) => currentProjects.filter((project) => project !== projectName))
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.project === projectName ? { ...task, project: fallbackProject } : task,
        ),
      )

      if (selectedProject === projectName) {
        setSelectedProject('all')
      }

      if (draft.project === projectName) {
        setDraft((currentDraft) => ({
          ...currentDraft,
          project: fallbackProject,
        }))
      }
    } catch (error) {
      setAuthError(error.message)
    }
  }

  return {
    boardColumns,
    tasks,
    projects,
    selectedProject,
    setSelectedProject,
    showComposer,
    setShowComposer,
    draggedTaskId,
    setDraggedTaskId,
    newProjectName,
    setNewProjectName,
    draft,
    visibleTasks,
    summary,
    projectCounts,
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
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
  }
}
