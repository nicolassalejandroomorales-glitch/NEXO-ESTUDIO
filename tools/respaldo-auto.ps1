# Respaldo automático de Nexo a GitHub (rama "respaldo-auto").
# - No toca master, ni tu índice, ni tu carpeta de trabajo.
# - Solo respalda si hay cambios Y llevas más de $QuietMinutes minutos sin editar.
# - Nunca usa force push y excluye .env, claves y certificados.
# Se ejecuta cada 10 min desde el Programador de tareas de Windows.

param([int]$QuietMinutes = 5)

$Branch = "respaldo-auto"
$Repo = Split-Path -Parent $PSScriptRoot
$Log = Join-Path $env:LOCALAPPDATA "nexo-respaldo.log"

function Log($msg) { Add-Content -Encoding UTF8 -Path $Log -Value ("{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg) }

Set-Location $Repo
$ErrorActionPreference = "Continue"

try {
    $changed = git status --porcelain=v1 -uall
    if (-not $changed) { exit 0 }

    # Esperar a que termines de editar
    $newest = [datetime]::MinValue
    foreach ($line in $changed) {
        $path = $line.Substring(3).Trim('"')
        if (Test-Path -LiteralPath $path) {
            $t = (Get-Item -LiteralPath $path).LastWriteTime
            if ($t -gt $newest) { $newest = $t }
        }
    }
    if (((Get-Date) - $newest).TotalMinutes -lt $QuietMinutes) {
        Log "Hay cambios pero se editó hace menos de $QuietMinutes min; espero."
        exit 0
    }

    # Índice temporal: no altera el tuyo
    $gitDir = (git rev-parse --git-dir).Trim()
    $tmpIndex = Join-Path $gitDir "respaldo-index"
    Copy-Item (Join-Path $gitDir "index") $tmpIndex -Force
    $env:GIT_INDEX_FILE = $tmpIndex
    git add -A -- . ":(exclude).env" ":(exclude)**/.env" ":(exclude).env.*" ":(exclude)**/.env.*" ":(exclude)*.pem" ":(exclude)*.key" ":(exclude)*.pfx" 2>$null
    $tree = (git write-tree).Trim()
    Remove-Item Env:GIT_INDEX_FILE
    Remove-Item $tmpIndex -Force -ErrorAction SilentlyContinue

    $parent = (git rev-parse --verify --quiet "refs/heads/$Branch")
    if (-not $parent) { $parent = (git rev-parse HEAD) }
    $parent = $parent.Trim()
    $parentTree = (git rev-parse "$parent^{tree}").Trim()
    if ($tree -eq $parentTree) { exit 0 }

    $msg = "Respaldo automático " + (Get-Date -Format "yyyy-MM-dd HH:mm")
    $commit = (git commit-tree $tree -p $parent -m $msg).Trim()
    git update-ref "refs/heads/$Branch" $commit
    git push origin "${Branch}:${Branch}" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "git push falló (código $LASTEXITCODE)" }
    Log "Respaldo subido: $commit"
}
catch {
    Log "ERROR: $_"
    exit 1
}
