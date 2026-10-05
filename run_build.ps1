Set-Location 'd:\projects\kanban board'
npm install 2>&1 | Tee-Object -FilePath 'd:\projects\kanban board\build.log'
npm run build 2>&1 | Tee-Object -FilePath 'd:\projects\kanban board\build.log' -Append
