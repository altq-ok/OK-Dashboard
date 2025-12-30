$ports = @(3000, 8000)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Closing port $port..." -ForegroundColor Gray
        $connections | ForEach-Object { 
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue 
        }
    }
}