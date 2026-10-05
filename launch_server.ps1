Set-Location 'd:\projects\kanban board'
Start-Process -Wait -NoNewWindow powershell -ArgumentList '-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', "Set-Location 'd:\projects\kanban board'; node server/index.js" 
