# Conexion de FemFitAI a Render desde Windows

## Resultado de la comprobacion de disponibilidad

El host proporcionado resuelve por DNS. El puerto 5432 acepta TCP y responde al
SSLRequest de PostgreSQL. Se pudo negociar TLS 1.3 con validacion del certificado.
Sin embargo, al enviar el inicio de sesion PostgreSQL con base femfitai y usuario
gabrielacard, el servidor cerro la conexion antes de solicitar autenticacion.
pg_isready tampoco obtuvo una respuesta PostgreSQL de disponibilidad.

Esto verifica acceso al servidor de Render, pero NO confirma que esta instancia
de base de datos siga activa. Confirmar en Render su estado y los datos actuales
de conexion. Una instancia no disponible, datos desactualizados o restricciones
de acceso requieren revision en Render; la prueba no determina cual es la causa.

Todavia no se ha arrancado Spring contra esta base, ni se ha comprobado un login
o un listado real. Falta una conexion PostgreSQL valida y DB_PASSWORD.

## Configuracion preparada

El application.properties del ZIP ya lee estas variables, sin secretos en codigo:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
server.port=${PORT:8080}
```

La URL JDBC preparada es:

```text
jdbc:postgresql://dpg-daptlqrtqb8s73doifqg-a.oregon-postgres.render.com:5432/femfitai?sslmode=require
```

DB_USERNAME es gabrielacard. No se incluyeron ni se generaron contrasenas de base
de datos. La clave JWT tampoco se guarda en archivos.

## Arranque con secretos introducidos de forma oculta

Desde PowerShell, en la raiz del frontend:

```powershell
.\scripts\iniciar-backend-render.ps1
```

El script prepara DB_URL y DB_USERNAME y solicita DB_PASSWORD y JWT_SECRET con
Read-Host -AsSecureString si no estaban definidos en el proceso. Usa JAVA_HOME
existente o el JDK 22 comprobado en esta maquina. No usa setx ni escribe secretos
en archivos o en el historial de comandos. Java recibe las variables a traves
del entorno del proceso. Al terminar, se restauran los valores anteriores.

Si es una instalacion local nueva y no necesitas conservar tokens previos:

```powershell
.\scripts\iniciar-backend-render.ps1 -GenerarClaveJwtLocal
```

Solo si JWT_SECRET no estaba definido, esa opcion genera 64 bytes aleatorios
con un generador criptografico y los convierte a Base64. No imprime ni guarda
la clave. Al reiniciar con otra clave debes iniciar sesion otra vez. Para
conservar tokens, reutiliza el JWT_SECRET existente mediante la entrada oculta.
No se modifica el secreto de una aplicacion desplegada en Render.

La copia preparada del backend esta en tmp/backend/FemFitAI-main. Si falta,
extraer el ZIP original antes de ejecutar el script:

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\FemFitAI-main.zip" -DestinationPath '.\tmp\backend'
```

El script copia la configuracion CORS al backend extraido e inicia Maven Wrapper.
Fuerza puerto 8080 y ddl-auto=validate para comprobar el esquema existente sin
actualizar tablas. Si faltan tablas, detenerse y confirmar que se usa la base
correcta; no crear datos de ejemplo ni cambiar automaticamente a update.

## JWT y permisos existentes

POST /login recibe correo y password. UsuariosUserDetailsService busca el correo
en Usuarios, exige Estado=true y rol PROGRAMADOR o TESTER. BCrypt valida la
contrasena contra PasswordHash. No es posible recuperar una contrasena desde el hash.

JwtTokenService firma un JWT HS512 con el correo en sub, los roles en roles y una
duracion de cinco horas. JwtConfig usa el mismo JWT_SECRET, convertido a bytes
UTF-8, para firmar y verificar. NimbusJwtDecoder valida la firma y la vigencia;
CustomJwtAuthenticationConverter obtiene las autoridades del claim roles.
GET /usuarios exige ROLE_PROGRAMADOR. Estas reglas no se modificaron.

## Identificar una cuenta existente

Con acceso autorizado a la base femfitai, ejecutar el archivo
backend-config/identificar-programador.sql en tu cliente PostgreSQL. Solo consulta
usuarios activos cuyo rol normalizado sea PROGRAMADOR, sin mostrar PasswordHash.
Si no devuelve filas, falta una cuenta activa de ese rol: solicitarla al responsable
de la base. No se crea una cuenta ni se cambia el rol de una usuaria desde este flujo.
Necesitas conocer la contrasena de la cuenta elegida para probar POST /login.

## Orden de comprobacion

1. Confirmar que Render mantiene activa esta base y que los datos de conexion son vigentes.
2. Ejecutar el script con la contrasena real. Spring debe terminar de arrancar en 8080
   y completar la validacion del esquema sin errores de conexion.
3. Comprobar el preflight CORS sin enviar credenciales:

```powershell
curl.exe -i -X OPTIONS http://localhost:8080/usuarios -H 'Origin: http://localhost:4200' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: authorization'
```

4. Desde otra terminal del frontend, ejecutar npm start -- --host localhost --port 4200
   y abrir http://localhost:4200. Ingresar la cuenta PROGRAMADOR existente.
5. En Network deben aparecer POST /login con HTTP 200 y luego GET /usuarios con HTTP 200.
   Angular envia el JWT recibido, guarda el arreglo real en signal y lo recorre con
   NgForOf y *ngFor. No se muestran registros simulados.

Un GET /usuarios sin JWT debe seguir rechazandose; no se desactiva la seguridad
para comprobar disponibilidad. Hasta disponer de la conexion y credenciales no
se puede confirmar el inicio de sesion ni la presencia de filas reales en Angular.
