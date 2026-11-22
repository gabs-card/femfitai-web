# Archivos integrados — 21 de noviembre de 2026

Integración de las pantallas aprobadas y de los avances de Progreso y Rutinas.
La configuración local de `angular.json` queda excluida. Los respaldos, perfiles
de prueba del navegador, dependencias y compilaciones permanecen fuera de Git.

Validación final: 32 pruebas de lógica, 59 comprobaciones de ADMIN/USUARIA y
22 regresiones de Progreso/Rutinas con API simulada; compilación de producción
correcta. No se ha probado contra una base de datos real.

| Archivo | Estado |
| --- | --- |
| `docs/avance-crud-graficos.md` | Creado |
| `docs/diseno-admin.md` | Creado |
| `propuestas-html/ABRIR.html` | Creado |
| `propuestas-html/LEEME.txt` | Creado |
| `propuestas-html/ejercicios.html` | Creado |
| `propuestas-html/estilos.css` | Creado |
| `propuestas-html/index.html` | Creado |
| `propuestas-html/interacciones.js` | Creado |
| `propuestas-html/metricas-admin.html` | Creado |
| `propuestas-html/metricas-usuaria.html` | Creado |
| `propuestas-html/modulos.html` | Creado |
| `propuestas-html/progreso.html` | Creado |
| `propuestas-html/revision-usuaria.css` | Creado |
| `propuestas-html/revision-usuaria.js` | Creado |
| `propuestas-html/rutinas.html` | Creado |
| `propuestas-html/usuario-formulario.html` | Creado |
| `propuestas-html/usuarios.html` | Creado |
| `scripts/administracion.test.mjs` | Creado |
| `scripts/progreso.test.mjs` | Creado |
| `scripts/rutinas.test.mjs` | Creado |
| `src/app/app.routes.ts` | Modificado |
| `src/app/components/administracioncomponent/administracion.css` | Creado |
| `src/app/components/administracioncomponent/administracion.routes.ts` | Creado |
| `src/app/components/administracioncomponent/cformejercicioscomponent/cformejercicioscomponent.html` | Creado |
| `src/app/components/administracioncomponent/cformejercicioscomponent/cformejercicioscomponent.ts` | Creado |
| `src/app/components/administracioncomponent/clistadminejercicioscomponent/clistadminejercicioscomponent.css` | Creado |
| `src/app/components/administracioncomponent/clistadminejercicioscomponent/clistadminejercicioscomponent.html` | Creado |
| `src/app/components/administracioncomponent/clistadminejercicioscomponent/clistadminejercicioscomponent.ts` | Creado |
| `src/app/components/administracioncomponent/graficobarrascomponent/graficobarrascomponent.css` | Creado |
| `src/app/components/administracioncomponent/graficobarrascomponent/graficobarrascomponent.html` | Creado |
| `src/app/components/administracioncomponent/graficobarrascomponent/graficobarrascomponent.ts` | Creado |
| `src/app/components/administracioncomponent/modulosadmincomponent/modulosadmincomponent.html` | Creado |
| `src/app/components/administracioncomponent/modulosadmincomponent/modulosadmincomponent.ts` | Creado |
| `src/app/components/administracioncomponent/paneladmincomponent/paneladmincomponent.html` | Creado |
| `src/app/components/administracioncomponent/paneladmincomponent/paneladmincomponent.ts` | Creado |
| `src/app/components/cicloscomponent/cinsertcicloscomponent/cinsertcicloscomponent.ts` | Modificado |
| `src/app/components/cicloscomponent/detallediariocomponent/detallediariocomponent.ts` | Modificado |
| `src/app/components/estadisticascomponent/estadisticascomponent.css` | Creado |
| `src/app/components/estadisticascomponent/estadisticascomponent.html` | Creado |
| `src/app/components/estadisticascomponent/estadisticascomponent.ts` | Creado |
| `src/app/components/homecomponent/homecomponent.css` | Modificado |
| `src/app/components/homecomponent/homecomponent.html` | Modificado |
| `src/app/components/homecomponent/homecomponent.ts` | Modificado |
| `src/app/components/layoutcomponent/layoutcomponent.css` | Modificado |
| `src/app/components/layoutcomponent/layoutcomponent.html` | Modificado |
| `src/app/components/layoutcomponent/layoutcomponent.ts` | Modificado |
| `src/app/components/menucomponent/menucomponent.css` | Modificado |
| `src/app/components/menucomponent/menucomponent.html` | Modificado |
| `src/app/components/perfilcomponent/perfilcomponent.ts` | Modificado |
| `src/app/components/progresocomponent/ceditprogresocomponent/ceditprogresocomponent.ts` | Modificado |
| `src/app/components/progresocomponent/cinsertprogresocomponent/cinsertprogresocomponent.ts` | Modificado |
| `src/app/components/progresocomponent/clistprogresocomponent/clistprogresocomponent.html` | Modificado |
| `src/app/components/progresocomponent/clistprogresocomponent/clistprogresocomponent.ts` | Modificado |
| `src/app/components/progresocomponent/graficoprogresocomponent/graficoprogresocomponent.css` | Creado |
| `src/app/components/progresocomponent/graficoprogresocomponent/graficoprogresocomponent.html` | Creado |
| `src/app/components/progresocomponent/graficoprogresocomponent/graficoprogresocomponent.ts` | Creado |
| `src/app/components/rutinascomponent/cinsertrutinascomponent/cinsertrutinascomponent.ts` | Modificado |
| `src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.css` | Modificado |
| `src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.html` | Modificado |
| `src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.ts` | Modificado |
| `src/app/components/sesionescomponent/cdetallessesioncomponent/cdetallessesioncomponent.ts` | Modificado |
| `src/app/components/sesionescomponent/cformsesionescomponent/cformsesionescomponent.ts` | Modificado |
| `src/app/components/sesionescomponent/clistsesionescomponent/clistsesionescomponent.ts` | Modificado |
| `src/app/components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent.css` | Modificado |
| `src/app/components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent.html` | Modificado |
| `src/app/components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent.ts` | Modificado |
| `src/app/components/usuarioscomponent/cinsertusuarioscomponent/cinsertusuarioscomponent.html` | Creado |
| `src/app/components/usuarioscomponent/cinsertusuarioscomponent/cinsertusuarioscomponent.ts` | Creado |
| `src/app/components/usuarioscomponent/clistusuarioscomponent/clistusuarioscomponent.html` | Modificado |
| `src/app/components/usuarioscomponent/clistusuarioscomponent/clistusuarioscomponent.ts` | Modificado |
| `src/app/components/usuarioscomponent/usuarioscomponent.css` | Modificado |
| `src/app/components/usuarioscomponent/usuarioscomponent.html` | Modificado |
| `src/app/components/usuarioscomponent/usuarioscomponent.ts` | Modificado |
| `src/app/services/ejerciciosservice.ts` | Modificado |
| `src/app/services/rutinasservice.ts` | Modificado |
| `src/app/services/usuariosservices.ts` | Modificado |
| `src/app/utils/estadisticas.ts` | Creado |
| `src/app/utils/graficos-progreso.ts` | Creado |
| `src/index.html` | Modificado |
| `docs/archivos-integrados.md` | Creado |

Los límites y endpoints pendientes se detallan en [Diseño ADMIN](diseno-admin.md).
