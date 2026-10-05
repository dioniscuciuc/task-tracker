export const boardColumns = [
  { id: 'backlog', title: 'Backlog', tone: 'sun' },
  { id: 'today', title: 'Today', tone: 'sky' },
  { id: 'doing', title: 'In motion', tone: 'mint' },
  { id: 'done', title: 'Done', tone: 'violet' },
]

export const normalisedProjects = ['Personal', 'Work', 'Home', 'Learning', 'Health']

export const projectClassMap = {
  Personal: 'project-personal',
  Work: 'project-work',
  Home: 'project-home',
  Learning: 'project-learning',
  Health: 'project-health',
}

export const starterTasks = [
  {
    id: 'task-1',
    title: 'Review weekly plan and block focus hours',
    project: 'Personal',
    status: 'today',
    priority: 'high',
    date: '2026-10-04',
    notes: 'Keep the first 90 minutes free from meetings and admin work.',
  },
  {
    id: 'task-2',
    title: 'Clean up the kitchen and prep tomorrow lunch',
    project: 'Home',
    status: 'backlog',
    priority: 'medium',
    date: '2026-10-05',
    notes: 'Pack a light meal and reset the counters before bed.',
  },
  {
    id: 'task-3',
    title: 'Finish the landing page wireframe',
    project: 'Work',
    status: 'doing',
    priority: 'high',
    date: '2026-10-06',
    notes: 'Focus on content hierarchy and CTA hierarchy before styling.',
  },
  {
    id: 'task-4',
    title: '30 minute language session',
    project: 'Learning',
    status: 'done',
    priority: 'low',
    date: '2026-10-03',
    notes: 'Complete vocabulary review and five sentence practice.',
  },
  {
    id: 'task-5',
    title: 'Gym session and walk',
    project: 'Health',
    status: 'backlog',
    priority: 'medium',
    date: '2026-10-05',
    notes: 'Move for 45 minutes and hydrate before the evening.',
  },
]

export const storageKeys = {
  tasks: 'lattice-board-tasks-v1',
  projects: 'lattice-board-projects-v1',
}
