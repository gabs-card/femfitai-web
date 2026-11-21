# Avance de CRUD y gráficos

**Informe del avance inicial.** El estado actual se amplía en
[Centro de gestión](centro-gestion.md): ADMIN dispone de mantenimiento real mediante
endpoints separados. El resto de este documento conserva el alcance y las
validaciones de la integración inicial como antecedente.

Se revisó como referencia el backend indicado por el equipo en
`trabajo/FemFitAI-main`.
Los diseños ADMIN fueron aprobados y su integración se documenta en
[Diseño ADMIN](diseno-admin.md). Las referencias HTML se conservan separadas. Este avance comienza por Progreso y conserva los componentes,
servicios, DTO, rutas y guards existentes. También conecta la eliminación de
rutinas que faltaba en Angular.

## Progreso

- Gráfico SVG de peso o medida opcional a partir de `GET /progreso`.
- Solo representa los registros de la página actual (10 registros como máximo),
  ordenados por fecha. No solicita otras páginas ni presenta esos datos como
  el historial completo.
- Conserva los valores recibidos. No interpola registros, genera mediciones ni
  añade recomendaciones de salud. La escala ajustada y las unidades son visibles.
- Una medición se representa con un punto. Las medidas opcionales ausentes
  permanecen ausentes, sin convertirse en cero. Los datos que no se pueden
  representar se indican; la tabla original se conserva.
- No se permiten solicitudes repetidas de guardar o eliminar mientras la
  operación correspondiente está pendiente. La paginación respeta sus límites.
- Al eliminar el último registro de una página, vuelve a la anterior y actualiza
  el gráfico con la respuesta del servidor. Los errores conservan el registro.
- La edición y eliminación comprueban el usuario de la sesión como validación
  de interfaz. La autorización real sigue en el backend.
- Los errores de carga ofrecen un botón para volver a intentar.

Endpoints existentes revisados: `POST /progreso`, `GET /progreso`,
`GET /progreso/{id}`, `PUT /progreso/{id}` y `DELETE /progreso/{id}`.
El backend de `trabajo` comprueba la propiedad en lectura por ID, actualización
y eliminación; el listado paginado se limita al usuario autenticado.

## Rutinas

Se añade `deleteRutina` a `Rutinasservice`, utilizando el endpoint existente
`DELETE /rutinas/{id}`, y el botón Eliminar en el listado. La confirmación
advierte que es permanente; se conservan desactivar y reactivar. El backend
actual comprueba que la rutina pertenezca a la cuenta autenticada.

Durante una eliminación, cambio de estado o inicio de entrenamiento, se evita
lanzar otra de estas operaciones. Una respuesta 409 conserva la tarjeta y explica
que existen registros relacionados, ofreciendo la desactivación como alternativa.
La tarjeta solo se retira cuando la API confirma la eliminación. No se modifican
sesiones, ejercicios asignados ni registros relacionados desde el frontend.

## Inventario para los siguientes módulos

| Módulo                                  | Estado en Angular y siguiente paso                                                                                                                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Usuarios                                | Registro público, listado ADMIN, edición, desactivación y reactivación existentes. El diseño aprobado se integra en el listado y edición. El alta administrativa reutiliza el registro con permisos ADMIN; el registro público conserva su comportamiento. |
| Ejercicios                              | Búsqueda y catálogo personales conservados; formularios y acciones ADMIN integrados en `/administracion/ejercicios`. El backend autoriza POST, PUT, DELETE y sincronización wger únicamente a ADMIN.                                                       |
| Rutinas                                 | Crear, consultar, editar, desactivar/reactivar y comenzar entrenamiento existentes. En este avance se conecta DELETE con confirmación, control de solicitudes repetidas y tratamiento de conflictos.                                                       |
| Rutina–Ejercicio                        | Selección de catálogo y CRUD existentes dentro de editar rutina; el backend actual tiene DELETE. No usar la copia antigua de E: como referencia.                                                                                                           |
| Sesiones / DetalleSesion / DetalleSerie | Formularios y operaciones existentes. Revisar funcionalmente sin rehacer lo implementado por el equipo.                                                                                                                                                    |
| Ciclos / Diario                         | Hay componentes y operaciones CRUD. Revisar consultas adicionales del diario y visualizaciones.                                                                                                                                                            |
| Progreso                                | CRUD existente y este avance de gráfico y control de operaciones.                                                                                                                                                                                          |
| Perfil                                  | Consultar, crear, actualizar y disponibilidad. El backend no expone DELETE; falta acordar cómo abordar ese requisito, sin inventar un endpoint.                                                                                                            |
| Recomendaciones                         | Listado, generación y aceptación existentes. El backend no expone PUT o DELETE para recomendaciones. Falta revisar generación por ciclo.                                                                                                                   |

El backend actual distingue ADMIN de USUARIA. ADMIN administra cuentas y catálogo;
no tiene permiso para consultar los datos personales de ciclos, progreso,
rutinas o sesiones. El diseño del panel no concede acceso a esas tablas.

## Consultas y gráficos pendientes

En los controllers y repositories revisados no se encontraron endpoints de
reportes agregados ni consultas con COUNT, AVG, SUM o GROUP BY. Sí hay consultas
con JOIN y filtros, además de listados paginados:

- Ciclos: detalle por ID y listado por usuaria.
- Diario: consulta propia por fecha, historial y entradas por ciclo.
- Ejercicios: búsqueda paginada, grupo muscular y ejercicios por usuaria con JOIN.
- Rutinas: listado por usuaria y detalle con JOIN.
- Rutina–Ejercicio: asignaciones de una rutina con JOIN.
- Sesiones: listado por usuaria y detalle con JOIN; ejercicios de sesión y series.
- Progreso y recomendaciones: listados propios paginados.

Cada consulta debe mapearse a una visualización que tenga sentido para sus
campos. La falta de una consulta administrativa no se resuelve consultando
datos personales con una sesión ADMIN. Las métricas de las propuestas HTML
son opciones de diseño, no reportes confirmados del backend.

## Archivos de este avance

Modificados:

- `src/app/components/progresocomponent/clistprogresocomponent/clistprogresocomponent.ts`
- `src/app/components/progresocomponent/clistprogresocomponent/clistprogresocomponent.html`
- `src/app/components/progresocomponent/cinsertprogresocomponent/cinsertprogresocomponent.ts`
- `src/app/components/progresocomponent/ceditprogresocomponent/ceditprogresocomponent.ts`
- `src/app/services/rutinasservice.ts`
- `src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.ts`
- `src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.html`
- `src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.css`

Creados:

- `src/app/components/progresocomponent/graficoprogresocomponent/graficoprogresocomponent.ts`
- `src/app/components/progresocomponent/graficoprogresocomponent/graficoprogresocomponent.html`
- `src/app/components/progresocomponent/graficoprogresocomponent/graficoprogresocomponent.css`
- `src/app/utils/graficos-progreso.ts`
- `scripts/progreso.test.mjs`
- `scripts/rutinas.test.mjs`
- `docs/avance-crud-graficos.md`

Los respaldos previos y sus hashes se conservan fuera del repositorio y no
forman parte de los commits.

## Verificación

Desde `femfitai-web-iosef`:

```powershell
node --test scripts/progreso.test.mjs scripts/rutinas.test.mjs
npm run build
```

Las pruebas comprueban la geometría del gráfico, fechas y medidas ausentes,
ordenación, paginación, duplicación de solicitudes y errores de autorización.
Resultado de este avance: 22 pruebas de lógica correctas y compilación de
producción correcta. La compilación conserva avisos de tamaño del bundle,
del CSS de detalle de sesión y de las fuentes; no se aumentaron los límites.
Las pruebas de lógica del componente sustituyen sus dependencias Angular y
HTTP; no constituyen pruebas de integración con Spring Boot o PostgreSQL.
Se comprobó además Progreso en el navegador con respuestas HTTP simuladas:
login mediante el formulario existente, peso/medida, paginación, eliminación
rechazada por 403, eliminación confirmada, doble clic, carga fallida, reintento
y ausencia de registros, en escritorio, tablet y móvil. Los datos de QA solo
existen en el proceso de prueba y nunca se incorporan al código de la aplicación.
La revisión final del navegador incluye también la eliminación de rutinas,
conflicto 409, conservación de la tarjeta y bloqueo de doble clic: 22
comprobaciones correctas en total, sin errores de JavaScript.

Para probar con el backend real: iniciarlo en el puerto 8080, ejecutar
`npm start` en Angular, abrir `http://localhost:4200`, entrar con una USUARIA y
visitar Progreso. Comprobar peso/medida, páginas, alta, edición y eliminación
de registros propios de prueba. No usar cuentas ni registros reales para
pruebas destructivas.

Este avance no cambia backend, base de datos, dependencias ni configuración local.
La integración aprobada añade rutas protegidas sin cambiar el código de los guards
o del servicio de autenticación. Los cambios anteriores se conservan; los commits
y la subida a la rama de trabajo fueron autorizados posteriormente.
