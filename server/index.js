import fs from 'fs'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const envFilePath = path.join(rootDir, '.env')

if (fs.existsSync(envFilePath)) {
  for (const line of fs.readFileSync(envFilePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const assignmentIndex = trimmed.indexOf('=')
    if (assignmentIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, assignmentIndex).trim()
    const value = trimmed.slice(assignmentIndex + 1).trim().replace(/^['"]|['"]$/g, '')

    if (key && !process.env[key]) {
      process.env[key] = value
    }
  }
}

const app = express()
const db = new Database(path.join(__dirname, 'kanban.db'))
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'lattice-board-dev-secret'

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const defaultProjects = ['Personal', 'Work', 'Home', 'Learning', 'Health']

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    project TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'medium',
    date TEXT,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(payload.sub)

    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lattice-board-api' })
})

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '').trim()

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Use a valid email and password with at least 6 characters.' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ message: 'An account with that email already exists.' })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const insert = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    const result = insert.run(email, passwordHash)
    const user = { id: result.lastInsertRowid, email }

    for (const projectName of defaultProjects) {
      db.prepare('INSERT OR IGNORE INTO projects (user_id, name) VALUES (?, ?)').run(user.id, projectName)
    }

    const token = issueToken(user)
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Could not create account.', error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '').trim()

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email)

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  const safeUser = { id: user.id, email: user.email }
  const token = issueToken(safeUser)

  return res.json({ token, user: safeUser })
})

app.get('/api/projects', authMiddleware, (req, res) => {
  const projects = db
    .prepare('SELECT name FROM projects WHERE user_id = ? ORDER BY id ASC')
    .all(req.user.id)

  res.json(projects.map((project) => project.name))
})

app.post('/api/projects', authMiddleware, (req, res) => {
  const projectName = String(req.body?.name || '').trim()

  if (!projectName) {
    return res.status(400).json({ message: 'Project name is required.' })
  }

  const existing = db
    .prepare('SELECT id FROM projects WHERE user_id = ? AND name = ?')
    .get(req.user.id, projectName)

  if (existing) {
    return res.status(409).json({ message: 'Project already exists.' })
  }

  db.prepare('INSERT INTO projects (user_id, name) VALUES (?, ?)').run(req.user.id, projectName)

  return res.status(201).json({ name: projectName })
})

app.delete('/api/projects/:name', authMiddleware, (req, res) => {
  const projectName = decodeURIComponent(req.params.name)
  const rows = db.prepare('SELECT name FROM projects WHERE user_id = ? ORDER BY id ASC').all(req.user.id)
  const remaining = rows.map((project) => project.name).filter((name) => name !== projectName)
  const fallbackProject = remaining[0] || 'Personal'

  db.prepare('DELETE FROM projects WHERE user_id = ? AND name = ?').run(req.user.id, projectName)
  db.prepare('UPDATE tasks SET project = ? WHERE user_id = ? AND project = ?').run(
    fallbackProject,
    req.user.id,
    projectName,
  )

  if (!remaining.length) {
    db.prepare('INSERT OR IGNORE INTO projects (user_id, name) VALUES (?, ?)').run(req.user.id, 'Personal')
  }

  return res.json({ deleted: projectName, movedTo: fallbackProject })
})

app.get('/api/tasks', authMiddleware, (req, res) => {
  const tasks = db
    .prepare(
      `SELECT id, title, project, status, priority, date, notes FROM tasks WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(req.user.id)

  res.json(tasks)
})

app.post('/api/tasks', authMiddleware, (req, res) => {
  const payload = req.body || {}
  const taskId = String(payload.id || `task-${Date.now()}`)
  const project = String(payload.project || 'Personal').trim() || 'Personal'
  const title = String(payload.title || '').trim()

  if (!title) {
    return res.status(400).json({ message: 'Task title is required.' })
  }

  const task = {
    id: taskId,
    user_id: req.user.id,
    title,
    project,
    status: String(payload.status || 'backlog'),
    priority: String(payload.priority || 'medium'),
    date: payload.date || null,
    notes: String(payload.notes || ''),
  }

  db.prepare(
    `INSERT INTO tasks (id, user_id, title, project, status, priority, date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    task.id,
    task.user_id,
    task.title,
    task.project,
    task.status,
    task.priority,
    task.date,
    task.notes,
  )

  return res.status(201).json(task)
})

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = req.params.id
  const updates = req.body || {}
  const current = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    .get(taskId, req.user.id)

  if (!current) {
    return res.status(404).json({ message: 'Task not found.' })
  }

  const nextTask = {
    title: updates.title ?? current.title,
    project: updates.project ?? current.project,
    status: updates.status ?? current.status,
    priority: updates.priority ?? current.priority,
    date: updates.date ?? current.date,
    notes: updates.notes ?? current.notes,
  }

  db.prepare(
    `UPDATE tasks
     SET title = ?, project = ?, status = ?, priority = ?, date = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    nextTask.title,
    nextTask.project,
    nextTask.status,
    nextTask.priority,
    nextTask.date,
    nextTask.notes,
    taskId,
    req.user.id,
  )

  return res.json({ id: taskId, ...nextTask })
})

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = req.params.id
  const changed = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, req.user.id)

  if (changed.changes === 0) {
    return res.status(404).json({ message: 'Task not found.' })
  }

  return res.json({ deleted: taskId })
})

app.use(express.static(path.join(__dirname, '..', 'dist')))
app.get(/^(?!\/api).*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next()
  }

  const distIndex = path.join(__dirname, '..', 'dist', 'index.html')
  res.sendFile(distIndex)
})

app.listen(PORT, () => {
  console.log(`Lattice Board API running on http://localhost:${PORT}`)
})
