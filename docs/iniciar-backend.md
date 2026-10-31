# Iniciar FemFitAI con PostgreSQL y JWT

Para la conexion de Render proporcionada posteriormente, usar
[conexion-render.md](conexion-render.md) y `scripts/iniciar-backend-render.ps1`.
El resto de esta pagina conserva la comprobacion inicial de PostgreSQL local.

## Estado comprobado

- PostgreSQL 18 está iniciado. `pg_isready -h localhost -p 5432` indica que acepta conexiones.
- Las credenciales del archivo local de `Desktop/FemFitAI/FemFitAI` fueron rechazadas
  por PostgreSQL. Que el puerto responda no demuestra que la base y las credenciales funcionen.
- La configuración del ZIP usa DB_URL, DB_USERNAME, DB_PASSWORD y JWT_SECRET.
  Ninguna estaba definida durante la revisión.
- JDK 22 está instalado en `C:/Program Files/Java/jdk-22`. El README del ZIP menciona
  Java 25, pero su pom.xml configura Java 17. La compilación con JDK 22 pasó.
- Maven Wrapper y sus dependencias estaban disponibles localmente.
- El backend se extrajo sin cambiar el ZIP a `tmp/backend/FemFitAI-main`.
- Se incorporó CorsConfig.java en `src/main/java/pe/edu/upc/femfitai/securities/`.
  La versión para conservar/aplicar a otro checkout está en `backend-config/CorsConfig.java`.
- No se ha confirmado una respuesta real de la API en el puerto 8080 ni se han
  recuperado usuarios de PostgreSQL. Faltan configuración y credenciales válidas.

## Información necesaria

1. Nombre de la base existente de FemFitAI y host/puerto, si no son localhost:5432.
2. Usuario y contraseña válidos de PostgreSQL con acceso a esa base y sus tablas.
3. JWT_SECRET del backend, o configurar una clave nueva de al menos 64 bytes para
   HS512 si se trata de una instalación local nueva. Cambiarla invalida tokens anteriores.
4. Correo y contraseña de una cuenta existente con rol PROGRAMADOR, estado true y
   PasswordHash BCrypt. Introducir la contraseña en el formulario de Angular; no
   hace falta compartirla por chat. No se crearon cuentas ni se cambiaron roles.

## Arranque desde PowerShell

En una terminal local, definir los valores reales. No usar literalmente los textos entre < >:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-22'
$env:DB_URL = 'jdbc:postgresql://localhost:5432/<BASE_REAL>'
$env:DB_USERNAME = '<USUARIO_POSTGRESQL_REAL>'
$env:DB_PASSWORD = '<CONTRASEÑA_POSTGRESQL_REAL>'
$env:JWT_SECRET = '<CLAVE_JWT_REAL_DE_AL_MENOS_64_BYTES>'
```

No guardar ni compartir estos valores en el repositorio. Desde la raíz del frontend:

```powershell
Set-Location '.\tmp\backend\FemFitAI-main'
.\mvnw.cmd -DskipTests compile
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--server.port=8080 --spring.jpa.hibernate.ddl-auto=validate --spring.jpa.show-sql=false'
```

Se usa validate para comprobar el esquema existente sin actualizar tablas.
El ZIP configura update por defecto, que sí puede modificar el esquema. Si validate
falla, revisar que sea la base de FemFitAI y que el esquema corresponda al backend;
no cambiar automáticamente a update. El backend debe permanecer ejecutándose en esa terminal.

## Flujo real de autenticación

POST http://localhost:8080/login recibe JSON con los campos correo y password.
UsuariosUserDetailsService busca el correo en Usuarios, exige una cuenta activa y
un rol permitido. Spring Security comprueba la contraseña con BCrypt.
La respuesta contiene accessToken, tokenType y rol (no incluye idUsuario).
El JWT usa HS512, contiene el claim roles y vence a las cinco horas.

GET http://localhost:8080/usuarios requiere Authorization: Bearer seguido del token
y rol PROGRAMADOR. No se desactivó ninguna regla de seguridad.

## Verificar CORS y datos reales

Con Spring iniciado, el preflight debe responder satisfactoriamente y contener
Access-Control-Allow-Origin: http://localhost:4200 y los permisos de cabeceras:

```powershell
curl.exe -i -X OPTIONS http://localhost:8080/usuarios -H 'Origin: http://localhost:4200' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: authorization'
curl.exe -i -X OPTIONS http://localhost:8080/login -H 'Origin: http://localhost:4200' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type'
```

Desde otra terminal, en la raíz del frontend:

```powershell
npm start -- --host localhost --port 4200
```

Abrir http://localhost:4200 e ingresar la cuenta PROGRAMADOR real. El formulario
consulta el listado automáticamente después de un inicio de sesión correcto.
En Network del navegador se debe observar POST /login con HTTP 200 y luego
GET /usuarios con HTTP 200 y un arreglo de los siete campos documentados.
No copiar el token ni la contraseña a capturas o documentación.

Una cuenta TESTER no puede listar todos los usuarios. Un 401 requiere revisar la
cuenta o renovar sesión; un 403 indica falta de permisos; un error de red puede
indicar backend apagado o CORS. Un arreglo vacío es una respuesta válida de una
base sin usuarios visibles y no se reemplaza por datos de ejemplo.
