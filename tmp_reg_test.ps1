$body = @{ email = 'test@example.com'; password = 'secret123' } | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/auth/register' -ContentType 'application/json' -Body $body
  $resp | ConvertTo-Json -Depth 10 | Set-Content -Path 'd:\projects\kanban board\tmp_reg.json'
}
catch {
  $_.Exception.Message | Set-Content -Path 'd:\projects\kanban board\tmp_reg_error.txt'
}
