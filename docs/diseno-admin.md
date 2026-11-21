# Diseño aprobado e integración Angular

Las maquetas aprobadas se conservan en `propuestas-html/ABRIR.html`. Son
referencias visuales independientes, con ejemplos explícitos. No se usan
sus datos de demostración en los componentes Angular.

## Rutas

| Ruta                                    | Rol         | Contenido                                                                   |
| --------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `/`                                     | Público     | Landing existente                                                           |
| `/login`, `/registro`                   | Público     | Formularios existentes                                                      |
| `/inicio`                               | Autenticado | Inicio según rol; panel administrativo diferido para ADMIN                  |
| `/usuarios/listar`                      | ADMIN       | Búsqueda, filtros, edición, desactivación y reactivación                    |
| `/usuarios/insertar`                    | ADMIN       | Reutiliza el formulario de registro en contexto administrativo              |
| `/usuarios/editar/:id`                  | ADMIN       | Edición por campos, conservando los que no se seleccionan                   |
| `/administracion/ejercicios`            | ADMIN       | Catálogo paginado, búsqueda y eliminación                                   |
| `/administracion/ejercicios/insertar`   | ADMIN       | Crear ejercicio                                                             |
| `/administracion/ejercicios/editar/:id` | ADMIN       | Editar ejercicio                                                            |
| `/administracion/metricas`              | ADMIN       | Gráficos de usuarios y catálogo                                             |
| `/administracion/modulos`               | ADMIN       | Mapa informativo de módulos y relaciones                                    |
| `/estadisticas`                         | USUARIA     | Sesiones del mes, tiempo registrado, rutinas activas y mediciones recientes |

Las rutas personales anteriores permanecen disponibles a USUARIA. Se conserva
el código de `authGuard`, `roleGuard`, `Loginservice` y el interceptor.
Las rutas nuevas utilizan esos mismos guards y los permisos del backend.
Los componentes administrativos se cargan bajo demanda.

## Cuentas

Se reutiliza `Usuarioscomponent`, incluyendo sus formularios reactivos y eventos.
El registro público sigue enviando nombres, apellidos, correo y contraseña;
no envía rol o estado. Crear una cuenta sigue mostrando el login y no inicia
sesión automáticamente.

En el contexto administrativo, con sesión ADMIN, se muestran rol y estado
inicial. El backend local revisado permite a ADMIN crear otra cuenta ADMIN y
asigna USUARIA cuando no se solicita un rol. La creación conserva la sesión
administrativa. Se mantiene la baja lógica y la protección de interfaz frente
a la desactivación de la propia cuenta.

## Catálogo

Se amplía `Ejerciciosservice`, conservando la búsqueda de USUARIA, para consumir
los endpoints existentes:

- `GET /ejercicios`, `GET /ejercicios/{id}`.
- `POST /ejercicios`, `PUT /ejercicios/{id}`, `DELETE /ejercicios/{id}`.

La eliminación exige confirmación y conserva la tarjeta ante un conflicto
de relaciones (409), error de permisos u otro fallo. Los formularios mantienen
valores heredados de tipo y grupo muscular, aunque no estén en los catálogos.
La descripción se representa como texto y se decodifica una vez para su edición;
la validación y escape finales permanecen en el backend.

## Gráficos y alcance de los datos

- ADMIN: cantidad de cuentas, cuentas activas/inactivas, registros por mes,
  catálogo completo, ejercicios por tipo y grupo muscular. Los registros sin
  fecha válida se excluyen del gráfico mensual; un estado ausente no se trata
  como activo.
- USUARIA: sesiones y minutos disponibles del mes elegido, rutinas activas,
  sesiones agrupadas por fecha y hasta diez mediciones recientes. El periodo
  filtra sesiones, mientras las mediciones representan la primera página del
  historial. Esta diferencia se explica en pantalla.
- Progreso: conserva su tabla paginada y el gráfico de peso o medida opcional.

Los indicadores se calculan con las respuestas de los endpoints existentes.
Una petición fallida se distingue de una lista vacía: se muestra el error y
los indicadores no se sustituyen por ceros. No se inventan endpoints de métricas,
ni se consulta información personal de usuarias desde ADMIN. El mapa de módulos
es informativo y no proporciona un CRUD universal de datos personales.

## Operaciones que requieren un acuerdo adicional

El backend actual no ofrece DELETE de Perfil ni PUT/DELETE genéricos de
Recomendaciones. Tampoco hay endpoints administrativos de estadísticas de
rutinas, ciclos o sesiones. No se crean acciones ficticias para esas operaciones.
La sincronización wger y la generación de recomendaciones por ciclo son
funcionalidades distintas de estas pantallas y no se ejecutan desde este avance.

## Validación

```powershell
node --test scripts/progreso.test.mjs scripts/rutinas.test.mjs scripts/administracion.test.mjs
npm run build
```

Las pruebas de lógica usan dependencias simuladas y no escriben en PostgreSQL.
La revisión de navegador utiliza un perfil temporal y respuestas de API
interceptadas; no demuestra la integración con una base de datos real.
Para la prueba real, ejecutar el backend local en 8080 y Angular con `npm start`
en 4200; comprobar con cuentas ADMIN y USUARIA de prueba.

Se conservaron respaldos fuera del repositorio antes de modificar archivos.
No se cambian backend, entidades, DTO, base de datos, dependencias, límites de
compilación ni configuración local. Los archivos temporales y respaldos no se
incluyen en los commits.
