import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { Subject } from 'rxjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function cargar(relative, dependencias = {}) {
  const filename = path.join(root,relative);
  const source = fs.readFileSync(filename,'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText;
  const exports = {};
  vm.runInNewContext(output,{
    exports,
    require: (nombre) => {
      if (!(nombre in dependencias)) throw new Error(`Dependencia de prueba no declarada: ${nombre}`);
      return dependencias[nombre];
    },
    confirm: () => true,
    history: {state:{}},
  },{filename});
  return exports;
}

const {crearGraficoProgreso} = cargar('src/app/utils/graficos-progreso.ts');
const dato = (id,fecha,pesoKg,medidaOpcional=null) => ({idProgreso:id,idUsuario:7,fecha,pesoKg,medidaOpcional,notaPersonal:null});

test('sin mediciones no fabrica puntos ni ejes', () => {
  const grafico = crearGraficoProgreso([],'pesoKg');
  assert.equal(grafico.puntos.length,0);
  assert.equal(grafico.linea,'');
  assert.equal(grafico.ejeVertical.length,0);
});
test('ordena cronológicamente sin modificar el historial original', () => {
  const datos = [dato(3,'2026-11-20',65),dato(1,'2026-11-01',66),dato(2,'2026-11-08',65.4)];
  const grafico = crearGraficoProgreso(datos,'pesoKg');
  assert.equal(grafico.puntos.map((p) => p.id).join(','),'1,2,3');
  assert.equal(datos.map((p) => p.idProgreso).join(','),'3,1,2');
  assert.equal(grafico.puntos[0].valor,66);
});
test('conserva la distancia temporal entre fechas', () => {
  const grafico = crearGraficoProgreso([dato(1,'2026-11-01',65),dato(2,'2026-11-02',66),dato(3,'2026-11-11',65)],'pesoKg');
  const [a,b,c] = grafico.puntos;
  assert.ok(Math.abs((b.x-a.x)/(c.x-a.x)-.1)<1e-10);
});
test('descarta fechas inexistentes y valores no numéricos o no positivos', () => {
  const grafico = crearGraficoProgreso([dato(1,'2026-02-30',65),dato(2,null,65),dato(3,'2026-11-01',NaN),dato(4,'2026-11-02',0),dato(5,'2026-11-03',Infinity),dato(6,'2026-11-04',-1),dato(7,'2026-11-05',65)],'pesoKg');
  assert.equal(grafico.puntos.length,1);
  assert.equal(grafico.omitidos,6);
});
test('una medición genera un punto centrado con escala finita', () => {
  const grafico = crearGraficoProgreso([dato(1,'2026-11-01',65)],'pesoKg');
  assert.equal(grafico.puntos[0].x,398);
  assert.ok(Number.isFinite(grafico.puntos[0].y));
  assert.equal(grafico.ejeHorizontal.length,1);
});
test('fechas y valores repetidos no causan divisiones por cero', () => {
  const grafico = crearGraficoProgreso([dato(2,'2026-11-01',65),dato(1,'2026-11-01',65)],'pesoKg');
  assert.equal(grafico.puntos.map((p) => p.id).join(','),'1,2');
  assert.ok(grafico.puntos.every((p) => Number.isFinite(p.x)&&Number.isFinite(p.y)));
});
test('las medidas opcionales ausentes no se convierten en cero', () => {
  const grafico = crearGraficoProgreso([dato(1,'2026-11-01',65,null),dato(2,'2026-11-02',66,80)],'medidaOpcional');
  assert.equal(grafico.puntos.length,1);
  assert.equal(grafico.puntos[0].valor,80);
  assert.equal(grafico.omitidos,1);
});

function listado() {
  class Servicio {}
  class Auth {}
  class Detector {}
  class Destruccion {}
  const carga = new Subject();
  const eliminacion = new Subject();
  const llamadas = {carga:[],eliminacion:[]};
  const instancias = new Map([
    [Servicio,{getProgreso:(...args) => {llamadas.carga.push(args);return carga;},deleteProgreso:(id) => {llamadas.eliminacion.push(id);return eliminacion;}}],
    [Auth,{getIdUsuario:() => 7}], [Detector,{detectChanges:() => {}}], [Destruccion,{}],
  ]);
  const {mensajeDeError} = cargar('src/app/utils/errores.ts');
  const {Clistprogresocomponent} = cargar('src/app/components/progresocomponent/clistprogresocomponent/clistprogresocomponent.ts',{
    '@angular/core': {Component:() => (clase) => clase,inject:(token) => instancias.get(token),ChangeDetectorRef:Detector,DestroyRef:Destruccion},
    '@angular/common': {DatePipe:class {}},
    '@angular/core/rxjs-interop': {takeUntilDestroyed:() => (source) => source},
    '@angular/material/table': {MatTableModule:class {}},
    '@angular/material/button': {MatButtonModule:class {}},
    '@angular/material/icon': {MatIconModule:class {}},
    '../../iconoaccioncomponent/iconoaccioncomponent': {Iconoaccioncomponent:class {}},
    '@angular/router': {RouterLink:class {}},
    '../../../services/progresoservice': {Progresoservice:Servicio},
    '../../../services/loginservice': {Loginservice:Auth},
    '../../../utils/errores': {mensajeDeError},
    '../graficoprogresocomponent/graficoprogresocomponent': {Graficoprogresocomponent:class {}},
  });
  return {component:new Clistprogresocomponent(),carga,eliminacion,llamadas};
}

test('no permite navegar fuera de los límites ni mientras carga', () => {
  const {component,llamadas} = listado();
  component.totalPaginas=3;
  component.cambiarPagina(-1);
  assert.equal(llamadas.carga.length,0);
  component.cambiarPagina(1);
  component.cambiarPagina(1);
  assert.equal(component.pagina,1);
  assert.equal(llamadas.carga.length,1);
});
test('soporta metadatos de página anidados y conserva el mensaje de éxito', () => {
  const {component,carga} = listado();
  component.obtenerProgreso('Registro actualizado correctamente.');
  carga.next({content:[dato(1,'2026-11-01',65)],page:{totalPages:3}});
  assert.equal(component.totalPaginas,3);
  assert.equal(component.mensaje,'Registro actualizado correctamente.');
  assert.equal(component.cargando,false);
});
test('distingue el fallo de carga de un historial vacío', () => {
  const {component,carga} = listado();
  component.obtenerProgreso();
  carga.error({status:403});
  assert.equal(component.cargaFallida,true);
  assert.equal(component.dataSource.length,0);
  assert.match(component.mensaje,/permiso/);
});
test('bloquea una segunda eliminación y la navegación durante el borrado', () => {
  const {component,llamadas} = listado();
  const registro=dato(1,'2026-11-01',65);
  component.dataSource=[registro];component.totalPaginas=3;
  component.eliminarProgreso(registro);
  component.eliminarProgreso(registro);
  component.cambiarPagina(1);
  assert.equal(llamadas.eliminacion.length,1);
  assert.equal(component.pagina,0);
  assert.equal(component.eliminandoId,1);
});
test('no elimina registros ajenos ni registros que no están en el listado', () => {
  const {component,llamadas} = listado();
  const registro={...dato(1,'2026-11-01',65),idUsuario:99};
  component.dataSource=[registro];
  component.eliminarProgreso(registro);
  component.eliminarProgreso(dato(2,'2026-11-01',65));
  assert.equal(llamadas.eliminacion.length,0);
});
test('al borrar el último registro de la última página carga la anterior', () => {
  const {component,eliminacion,llamadas} = listado();
  const registro=dato(11,'2026-11-01',65);
  component.dataSource=[registro];component.pagina=1;component.totalPaginas=2;
  component.eliminarProgreso(registro);
  eliminacion.next();
  assert.equal(component.pagina,0);
  assert.equal(llamadas.carga[0][0],0);
  assert.equal(component.eliminandoId,null);
});
test('un error de autorización al eliminar conserva el registro', () => {
  const {component,eliminacion} = listado();
  const registro=dato(1,'2026-11-01',65);
  component.dataSource=[registro];component.eliminarProgreso(registro);
  eliminacion.error({status:403});
  assert.equal(component.dataSource.length,1);
  assert.equal(component.eliminandoId,null);
  assert.match(component.mensaje,/permiso/);
});
