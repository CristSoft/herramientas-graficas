$ErrorActionPreference = 'Stop'
$previewPort = 8772
$previewUrl = 'http://127.0.0.1:' + $previewPort + '/'
$nodeRuntime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
if (-not (Test-Path -LiteralPath $nodeRuntime)) { $nodeRuntime = (Get-Command node -ErrorAction Stop).Source }
function Test-PreviewReady {
  try {
    $page = Invoke-WebRequest $previewUrl -UseBasicParsing -TimeoutSec 2
    $atlas = Invoke-WebRequest ($previewUrl + 'lower/hymn-3d.webp') -Method Head -UseBasicParsing -TimeoutSec 2
    return $page.Content.Contains('<title>Herramientas gráficas</title>') -and $atlas.Headers['Content-Type'] -eq 'image/webp'
  } catch {
    return $false
  }
}
$previewReady = Test-PreviewReady
if (-not $previewReady -and (Get-NetTCPConnection -LocalPort $previewPort -State Listen -ErrorAction SilentlyContinue)) {
  $previewPort = 8773
  $previewUrl = 'http://127.0.0.1:' + $previewPort + '/'
  $previewReady = Test-PreviewReady
}
if (-not $previewReady) {
  $priorPort = $env:PORT
  try {
    $env:PORT = [string]$previewPort
    Start-Process -FilePath $nodeRuntime -ArgumentList ('"' + (Join-Path $PSScriptRoot 'static-server.cjs') + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
  } finally { $env:PORT = $priorPort }
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 200
    $previewReady = Test-PreviewReady
    if ($previewReady) { break }
  }
}
if (-not $previewReady) { throw "No se pudo abrir la prueba. Revisá que el puerto $previewPort esté disponible." }
Start-Process $previewUrl
