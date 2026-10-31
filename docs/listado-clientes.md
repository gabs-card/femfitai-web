# Listado de usuarios de FemFitAI

## Contrato revisado

Se revisaron `Usuarios`, `UsuariosDTO`, `UsuariosController`, `IUsuariosService`,
`UsuariosService`, `UsuariosRepository` y `SecurityConfig` dentro de
`C:/Users/Acer/Downloads/FemFitAI-main.zip`.
La copia de `Desktop/FemFitAI/FemFitAI` no contiene el módulo de usuarios.
El ZIP `FemFitAI-main (1).zip` contiene otra versión, con diferencias en el DTO
y en los permisos. Debe ejecutarse una versión compatible con el contrato descrito aquí.

- Endpoint: `GET /usuarios`.
- Respuesta: un arreglo de `UsuariosDTO`, sin paginación ni envoltorio.
- Campos: `idUsuario`, `nombres`, `apellidos`, `correo`, `rol`, `estado`,
  `fechaRegistro`.
- `estado` y `fechaRegistro` pueden ser nulos. La fecha se recibe como texto.
- `passwordHash` es de escritura solamente y no forma parte del modelo del listado.
- La consulta requiere `Authorization: Bearer <JWT>` y rol `PROGRAMADOR`.
- Los únicos roles admitidos en el servicio son `PROGRAMADOR` y `TESTER`.
  No existe una entidad Cliente ni un rol CLIENTE. Pendiente confirmar qué rol
  representa a las clientas. Por ahora se muestran todos los usuarios devueltos
  por el endpoint y la pantalla se identifica como «Usuarios registrados».

## Archivos y funcionamiento

- `src/app/models/UsuarioDTO.ts`: modelo con los campos de lectura del backend.
- `src/app/services/usuariosservices.ts`: `UsuariosService`, con `@Injectable`,
  inyección por constructor y signals para datos, carga y error. `listar()` hace
  la petición GET y guarda la respuesta mediante `usuarios.set(...)`.
- `src/app/components/lista-clientes/`: componente generado con Angular CLI,
  HTML con `NgForOf`, `*ngFor` e interpolación, y CSS separado.
  `ngOnInit()` solicita el listado al entrar a la pantalla.
- `src/app/app.config.ts`: registra `provideHttpClient()`.
- `src/app/app.ts` y `src/app/app.html`: importan y muestran el componente.

El componente `logincomponent` contiene el formulario de acceso. Envía correo y
contraseña a `POST /login` mediante el `Authservice` existente. El servicio guarda
el token y el rol; la contraseña no se guarda y se limpia del formulario al enviarlo.
Al recibir el rol PROGRAMADOR, el componente llama a `UsuariosService.listar()`.
El servicio manda `Authorization: Bearer <JWT>` y actualiza el signal que recorre
el HTML. El backend sigue validando el token y el rol; la comprobación en Angular
solo evita una petición que no tendría permisos.
Sin sesión, la pantalla informa que hace falta iniciar sesión y no presenta datos ficticios.

## Conexión y CORS

El entorno de desarrollo existente apunta a `http://localhost:8080`.
No hubo respuesta de un backend en ese puerto durante la verificación.
El entorno de producción conserva una URL de ejemplo (`TU-SERVICIO.onrender.com`);
debe reemplazarse por la URL real antes de desplegar.

Angular en `http://localhost:4200` y Spring en `http://localhost:8080` tienen
orígenes diferentes. Se agregó `backend-config/CorsConfig.java` a la copia de
trabajo extraída en `tmp/backend/FemFitAI-main`, dentro del paquete `securities`.
Permite el origen `http://localhost:4200`, los métodos GET, POST y OPTIONS y las
cabeceras Authorization y Content-Type. La configuración de Spring Security ya
activa `.cors(...)` y permite OPTIONS; no se modificaron los permisos JWT.
Abrir Angular con `localhost`, porque `127.0.0.1` es otro origen.
El ZIP original y el backend incompleto del escritorio no se modificaron.

Un error HTTP 0 puede indicar servidor apagado, problemas de red o CORS; revisar
la pestaña Network del navegador para distinguirlos. Se muestran mensajes
específicos para 401 (sesión inválida) y 403 (sin permisos).

## Comandos

```bash
ng generate component components/lista-clientes --type=component --style=css --standalone --skip-tests
npm run build
ng serve
```

Las compilaciones de Angular y de la copia del backend con CORS pasaron.
La recuperación de registros reales queda pendiente de credenciales válidas de
PostgreSQL, variables del backend configuradas y una cuenta con permisos.
La respuesta CORS todavía debe comprobarse con el backend iniciado.

Ver [iniciar-backend.md](iniciar-backend.md) para los requisitos comprobados,
las variables que faltan y los comandos para iniciar la copia preparada.
Para la base de Render, ver [conexion-render.md](conexion-render.md): contiene la
URL JDBC con SSL y el comando de arranque con entrada oculta de secretos.
