# Centro de gestión con datos reales

El menú ADMIN incluye **Centro de gestión** en `/administracion/modulos`.
Cada tarjeta abre su módulo, muestra registros paginados y permite filtrar por
cuenta propietaria. Usuarios, catálogo y métricas conservan sus componentes.
Las diez pantallas nuevas comparten un componente standalone con formulario
reactivo, HTML y CSS separados; los selectores cargan referencias reales de la API.

## Acciones disponibles

| Módulo               | Acciones ADMIN                                                                      |
| -------------------- | ----------------------------------------------------------------------------------- |
| Ciclos               | Consultar, crear, editar fechas, cerrar y eliminar sin diario relacionado           |
| Diario del ciclo     | Consultar, crear, editar y eliminar; una entrada por usuaria y fecha                |
| Rutinas              | Consultar, crear, editar, activar/desactivar y eliminar sin relaciones              |
| Ejercicios de rutina | Consultar, asignar, editar planificación y retirar asignación                       |
| Sesiones             | Consultar, iniciar desde rutina y finalizar; se conserva el historial               |
| Ejercicios de sesión | Consultar; crear, editar observación y eliminar solo EN_CURSO, sin series al borrar |
| Series               | Consultar; crear, editar repeticiones/peso y eliminar solo EN_CURSO                 |
| Progreso             | Consultar, crear, editar y eliminar mediciones                                      |
| Perfiles             | Consultar, crear, editar y eliminar; un perfil por cuenta                           |
| Recomendaciones      | Consultar, crear manualmente, editar y eliminar; no invoca el generador IA          |

No se transfieren registros existentes entre usuarias ni se cambian sus referencias.
Las recomendaciones solo pueden relacionarse con rutinas de la misma propietaria.
Los borrados con relaciones se bloquean: no se elimina información en cascada.

## Contrato y permisos

- Angular: `/administracion/modulos/:modulo`.
- API: `GET /administracion/{modulo}?pagina=0&tamano=10&idUsuario=...`.
  `idUsuario` es opcional; tamaño de página entre 1 y 100.
- `GET /administracion/{modulo}/{id}`: detalle y permiso de modificación.
- `POST /administracion/{modulo}`: creación, respuesta 201.
- `PUT /administracion/{modulo}/{id}`: actualización, respuesta 200.
- `DELETE /administracion/{modulo}/{id}`: eliminación, respuesta 204.
  En sesiones devuelve 405 porque se conserva el historial.
- Slugs: `ciclos`, `detalle-diario`, `rutinas`, `rutina-ejercicios`, `sesiones`,
  `detalle-sesion`, `detalle-serie`, `progreso`, `perfiles`, `recomendaciones`.
- Se reutilizan los DTO de cada módulo para creación y edición.
  Las consultas devuelven `{idUsuario, datos, modificable}` con el DTO del registro.
  No se serializan entidades de usuarios ni hashes de contraseña.
- Controller y service exigen `hasRole('ADMIN')` mediante la seguridad de métodos
  que ya estaba habilitada. No se modifica `SecurityConfig` ni la autenticación.
- Las rutas personales de USUARIA mantienen sus guards y comprobaciones de propiedad.
  USUARIA recibe 403 en los endpoints nuevos; sin sesión se recibe 401.
- Validación: 400 para datos inválidos, 404 para registros ausentes y 409 para
  duplicados, relaciones y estados incompatibles.

## Cómo probar en local

1. Abrir el backend modificado `trabajo/FemFitAI-main` en IntelliJ y **reiniciar**
   `FemFitAiApplication`. El proceso anterior no incorpora las clases nuevas.
2. Ejecutar `npm start` desde `femfitai-web-iosef` si Angular no está activo.
3. Entrar con una cuenta ADMIN y abrir `http://localhost:4200/administracion/modulos`.
4. Seleccionar un módulo y una cuenta. Los formularios escriben datos reales:
   confirmar la cuenta y los valores antes de guardar o eliminar.

No se necesita ejecutar SQL, crear tablas ni cambiar variables de entorno.
Las copias de seguridad y el registro de hashes están fuera de ambos proyectos,
en `femfitai-web-main/tmp/centro-gestion-20261121`.
La copia del backend sigue siendo un ZIP sin Git; estos cambios deben integrarse
posteriormente en una rama propia del repositorio del equipo.
No se hacen commits, push ni cambios en `main`.

## Validación

- `npm run build`: correcto, conserva los avisos previos de tamaño.
- `node --test scripts/progreso.test.mjs scripts/rutinas.test.mjs scripts/administracion.test.mjs scripts/centro-gestion.test.mjs`: 42 pruebas correctas.
- `mvnw.cmd -Dtest=AdministracionIntegrationTest test`: 12 pruebas de integración
  con HTTP real y base H2 en memoria, incluyendo permisos y aislamiento por propietaria.
- Recorrido de navegador: 82 comprobaciones contra Spring Boot real en 8081 con H2
  temporal, login, CRUD, filtros, errores e historial, a 1440/768/390/320 px.
  El proxy de QA solo redirige solicitudes de prueba; no cambia Angular.
- Las pruebas no acceden a PostgreSQL ni usan la sesión personal del navegador.
  La integración con la base local se realiza al reiniciar el backend y usar la web.

## Archivos de esta contribución

### Angular

- `docs/avance-crud-graficos.md`
- `docs/centro-gestion.md`
- `docs/diseno-admin.md`
- `scripts/centro-gestion.test.mjs`
- `src/app/components/administracioncomponent/administracion.routes.ts`
- `src/app/components/administracioncomponent/gestionadmincomponent/gestionadmincomponent.css`
- `src/app/components/administracioncomponent/gestionadmincomponent/gestionadmincomponent.html`
- `src/app/components/administracioncomponent/gestionadmincomponent/gestionadmincomponent.ts`
- `src/app/components/administracioncomponent/gestionadmincomponent/modulos-administracion.ts`
- `src/app/components/administracioncomponent/modulosadmincomponent/modulosadmincomponent.css`
- `src/app/components/administracioncomponent/modulosadmincomponent/modulosadmincomponent.html`
- `src/app/components/administracioncomponent/modulosadmincomponent/modulosadmincomponent.ts`
- `src/app/components/administracioncomponent/paneladmincomponent/paneladmincomponent.html`
- `src/app/components/menucomponent/menucomponent.html`
- `src/app/models/RegistroAdministracionDTO.ts`
- `src/app/services/administracionservice.ts`

### Spring Boot

- `docs/centro-gestion.md`
- `src/main/java/pe/edu/upc/femfitai/controllers/AdministracionController.java`
- `src/main/java/pe/edu/upc/femfitai/dtos/RegistroAdministracionDTO.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/CiclosRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/DetalleDiarioCicloRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/DetalleSerieRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/DetalleSesionRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/PerfilEntrenamientoRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/ProgresoRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/RecomendacionesIARepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/RutinaEjerciciosRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/RutinasRepository.java`
- `src/main/java/pe/edu/upc/femfitai/repositories/SesionesEntrenamientoRepository.java`
- `src/main/java/pe/edu/upc/femfitai/services/implementations/AdministracionService.java`
- `src/main/java/pe/edu/upc/femfitai/services/interfaces/IAdministracionService.java`
- `src/test/java/pe/edu/upc/femfitai/AdministracionIntegrationTest.java`
