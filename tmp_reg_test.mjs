const body = { email: 'test@example.com', password: 'secret123' }

try {
  const response = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  await import('node:fs/promises').then(fs => fs.writeFile('d:/projects/kanban board/tmp_reg_result.txt', `${response.status}\n${text}`))
  console.log('done')
} catch (error) {
  await import('node:fs/promises').then(fs => fs.writeFile('d:/projects/kanban board/tmp_reg_result.txt', `ERR\n${error.message}`))
  console.log('err')
}
