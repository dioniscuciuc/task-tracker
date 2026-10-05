try {
  $response = Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -Method Get -TimeoutSec 5
  $response.Content | Set-Content -Path 'd:\projects\kanban board\check_port_response.txt'
}
catch {
  $_.Exception.Message | Set-Content -Path 'd:\projects\kanban board\check_port_error.txt'
}
