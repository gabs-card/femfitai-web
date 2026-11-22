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

## Reportes y aislamiento de consultas — 21 de noviembre de 2026

Se incorpora `Reportescomponent`, standalone con HTML/CSS separados, en
`/administracion/metricas` y `/estadisticas`. Conserva los gráficos anteriores,
los guards y las operaciones de cada rol. El explorador ofrece once módulos:
ciclos, diario, rutinas, ejercicios de rutina, sesiones, ejercicios de sesión,
series realizadas, progreso, perfiles, recomendaciones y catálogo.

- Cada reporte consulta sus datos al seleccionarlo. Los listados paginados se
  recorren completos; si una página falla, no se publica un total parcial.
- ADMIN filtra por cuenta; USUARIA utiliza únicamente su ID de sesión. Ciclos y
  rutinas admiten selección propia; ejercicios de sesión y series requieren una
  sesión real. El catálogo admite el filtro exacto por grupo muscular.
- El filtro opcional de mes utiliza la fecha propia del módulo: inicio de ciclo,
  creación de rutina o fecha de registro. No afecta a módulos sin fecha propia.
- Las barras identifican sus unidades y ofrecen una tabla de valores. Las fechas
  inválidas, duraciones ausentes y otras medidas incompletas no se convierten en
  cero. La duración del ciclo utiliza exclusivamente inicio y cierre real.
- Progreso permite consultar el historial completo y sus filtros. ADMIN debe
  seleccionar una cuenta para ver una curva; no se mezclan mediciones personales.
- Los JOIN de ciclos, rutinas, ejercicios por usuaria y asignaciones se conectan
  desde los servicios existentes. La agregación es local en Angular; no se crean
  endpoints de reportes ni se cambian entidades o esquemas.
- Los errores permiten reintentar. Cambiar de reporte cancela la petición anterior
  para evitar mostrar respuestas desactualizadas. Diseño revisado a 1440, 768,
  390 y 320 px.

El backend corrige cuatro accesos de lectura que omitían la propiedad:
`GET /detalle-diario`, `GET /detalle-diario/ciclo/{idCiclo}`,
`GET /sesiones/detalle/{id}` y `GET /ejercicios/usuario/{idUsuario}`.
El listado de diario se filtra por la cuenta autenticada. Los otros tres
comprueban la propiedad mediante `UsuarioActualService` antes de consultar.
No se modifica autenticación, `SecurityConfig`, DTO del backend ni reglas CRUD.

Validación final del avance:

- `npm run build`: correcto, con los tres avisos de tamaño ya conocidos.
- `node --test scripts/progreso.test.mjs scripts/rutinas.test.mjs scripts/administracion.test.mjs scripts/centro-gestion.test.mjs scripts/reportes.test.mjs`: 60 pruebas correctas.
- `mvnw.cmd -Dtest=AdministracionIntegrationTest test`: 16 pruebas correctas con
  HTTP y H2, incluidas cuatro regresiones nuevas de aislamiento.
- 80 comprobaciones GET sobre PostgreSQL con una instancia de QA de solo lectura:
  ninguna exposición de registros ajenos en las consultas probadas.
- 48 comprobaciones de navegador sobre Spring Boot real: once reportes por rol,
  filtros, estado vacío, error/reintento, cambio de cuenta y responsive. Sin
  errores JavaScript ni mutaciones de registros.

Para usar los cambios: reiniciar el backend actualizado y ejecutar `npm start`
en Angular. Entrar con ADMIN en Métricas o con USUARIA en Mis estadísticas y
bajar hasta **Explorar reportes**. No es necesario ejecutar SQL ni alterar datos.
La instancia temporal 8082 y el proxy del navegador pertenecen solo al QA;
la aplicación conserva `environment.apiUrl` y su configuración de despliegue.

Límites conservados: las sesiones no se eliminan; el perfil personal no tiene
DELETE; las recomendaciones personales se consultan, generan por ciclo y
aceptan. Su generación externa no se invoca durante estas pruebas. El repository
de historial diario no expuesto como endpoint sigue siendo una consulta interna.
