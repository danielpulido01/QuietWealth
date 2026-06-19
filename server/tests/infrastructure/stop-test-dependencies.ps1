[CmdletBinding()]
param(
    [string]$ComposeFile = "$PSScriptRoot/docker-compose.integration.yml",
    [switch]$DeleteVolumes
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is required but was not found on PATH."
}

$args = @("compose", "-f", $ComposeFile, "down", "--remove-orphans")
if ($DeleteVolumes) {
    $args += "--volumes"
}

Write-Host "Stopping backend test dependencies from $ComposeFile"
& docker @args
