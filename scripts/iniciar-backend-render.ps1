param(
    [switch]$GenerarClaveJwtLocal
)

$ErrorActionPreference = 'Stop'
$backendPath = Join-Path $PSScriptRoot '../tmp/backend/FemFitAI-main'
$corsPath = Join-Path $PSScriptRoot '../backend-config/CorsConfig.java'

if (!(Test-Path -LiteralPath (Join-Path $backendPath 'mvnw.cmd'))) {
    throw 'Falta la copia del backend en tmp/backend/FemFitAI-main. Consulta docs/conexion-render.md.'
}

function Read-SecretValue([string]$Prompt) {
    $secureValue = Read-Host $Prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        $secureValue.Dispose()
    }
}

$variableNames = @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET', 'JAVA_HOME')
$previousValues = @{}
foreach ($variableName in $variableNames) {
    $previousValues[$variableName] = [Environment]::GetEnvironmentVariable($variableName, 'Process')
}

$locationChanged = $false
try {
    $env:DB_URL = 'jdbc:postgresql://dpg-daptlqrtqb8s73doifqg-a.oregon-postgres.render.com:5432/femfitai?sslmode=require'
    $env:DB_USERNAME = 'gabrielacard'

    if (!$env:DB_PASSWORD) {
        $env:DB_PASSWORD = Read-SecretValue 'Password de PostgreSQL en Render'
    }
    if (!$env:DB_PASSWORD) {
        throw 'DB_PASSWORD no puede estar vacia.'
    }

    if (!$env:JWT_SECRET) {
        if ($GenerarClaveJwtLocal) {
            $randomBytes = New-Object byte[] 64
            $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
            try {
                $generator.GetBytes($randomBytes)
                $env:JWT_SECRET = [Convert]::ToBase64String($randomBytes)
            }
            finally {
                $generator.Dispose()
                [Array]::Clear($randomBytes, 0, $randomBytes.Length)
            }
        }
        else {
            $env:JWT_SECRET = Read-SecretValue 'JWT_SECRET existente del backend (entrada oculta)'
        }
    }
    if ([Text.Encoding]::UTF8.GetByteCount($env:JWT_SECRET) -lt 64) {
        throw 'JWT_SECRET debe tener al menos 64 bytes UTF-8 para HS512.'
    }

    if (!$env:JAVA_HOME) {
        $installedJdk = 'C:/Program Files/Java/jdk-22'
        if (Test-Path -LiteralPath (Join-Path $installedJdk 'bin/javac.exe')) {
            $env:JAVA_HOME = $installedJdk
        }
        else {
            throw 'Configura JAVA_HOME con la ruta de un JDK compatible antes de ejecutar.'
        }
    }

    Copy-Item -LiteralPath $corsPath -Destination (Join-Path $backendPath 'src/main/java/pe/edu/upc/femfitai/securities/CorsConfig.java')
    Push-Location -LiteralPath $backendPath
    $locationChanged = $true
    Write-Host 'Iniciando FemFitAI en localhost:8080 con Render y SSL. No se actualizaran tablas.'
    & '.\mvnw.cmd' 'spring-boot:run' '-Dspring-boot.run.arguments=--server.port=8080 --spring.jpa.hibernate.ddl-auto=validate --spring.jpa.show-sql=false'
    if ($LASTEXITCODE -ne 0) {
        throw 'El backend no pudo arrancar. Revisa el error de Spring en esta terminal.'
    }
}
finally {
    if ($locationChanged) {
        Pop-Location
    }
    foreach ($variableName in $variableNames) {
        [Environment]::SetEnvironmentVariable($variableName, $previousValues[$variableName], 'Process')
    }
}
