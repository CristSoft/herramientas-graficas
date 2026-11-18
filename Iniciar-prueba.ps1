$ErrorActionPreference = 'Stop'
$previewPort = 8772
$previewUrl = 'http://127.0.0.1:' + $previewPort + '/'
$nodeRuntime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
if (-not (Test-Path -LiteralPath $nodeRuntime)) { $nodeRuntime = (Get-Command node -ErrorAction Stop).Source }
$previewReady = $false
try { $previewReady = (Invoke-WebRequest $previewUrl -UseBasicParsing -TimeoutSec 2).Content.Contains('Exportación desde el navegador') } catch {}
if (-not $previewReady) {
  $priorPort = $env:PORT
  try {
    $env:PORT = [string]$previewPort
    Start-Process -FilePath $nodeRuntime -ArgumentList ('"' + (Join-Path $PSScriptRoot 'static-server.cjs') + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
  } finally { $env:PORT = $priorPort }
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 200
    try { $previewReady = (Invoke-WebRequest $previewUrl -UseBasicParsing -TimeoutSec 1).Content.Contains('Exportación desde el navegador'); if ($previewReady) { break } } catch {}
  }
}
if (-not $previewReady) { throw 'No se pudo abrir la prueba. Revisá que el puerto 8772 esté disponible.' }
Start-Process $previewUrl
