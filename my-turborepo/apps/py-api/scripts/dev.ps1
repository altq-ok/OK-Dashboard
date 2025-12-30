$ErrorActionPreference = 'SilentlyContinue'

while ($true) {
    Write-Host "--- [py-api] Starting Uvicorn ---" -ForegroundColor Cyan
    # conda run -n my-env uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
    cmd /c "uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    Write-Host "--- Uvicorn process exited. Restarting... ---" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}
