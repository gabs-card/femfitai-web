import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { Subject, of } from 'rxjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function cargar(relative, dependencias, confirmar = true) {
  const filename = path.join(root,relative);
  const source = fs.readFileSync(filename,'utf8');
  const output = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText;
  const exports = {};
  vm.runInNewContext(output,{exports,require:(nombre) => {
    if (!(nombre in dependencias)) throw new Error(`Dependencia de prueba no declarada: ${nombre}`);
    return dependencias[nombre];
  },confirm:() => confirmar,history:{state:{}}},{filename});
  return exports;
}
const rutina = (id=1,idUsuario=7) => ({idRutina:id,idUsuario,nombre:'Rutina QA',objetivo:'Fuerza',nivel:'Inicial',fechaCreacion:'2026-11-20',estado:true});

function listado(confirmar = true) {
  class Servicio {}
  class Auth {}
  class Sesiones {}
  class Router {}
  class Detector {}
  const eliminacion = new Subject();
  const actualizacion = new Subject();
  const llamadas = {eliminacion:[],actualizacion:[],inicio:[]};
  const instancias = new Map([
    [Servicio,{getRutinasUsuario:() => of([rutina()]),deleteRutina:(id) => {llamadas.eliminacion.push(id);return eliminacion;},updateRutina:(...args) => {llamadas.actualizacion.push(args);return actualizacion;}}],
    [Auth,{getIdUsuario:() => 7}],
    [Sesiones,{iniciarDesdeRutina:(id) => {llamadas.inicio.push(id);return new Subject();}}],
    [Router,{navigate:() => Promise.resolve(true)}],
    [Detector,{detectChanges:() => {}}],
  ]);
  const {mensajeDeError} = cargar('src/app/utils/errores.ts',{});
  const {Clistrutinascomponent} = cargar('src/app/components/rutinascomponent/clistrutinascomponent/clistrutinascomponent.ts',{
    '@angular/core':{Component:() => (clase) => clase,inject:(token) => instancias.get(token),ChangeDetectorRef:Detector},
    '@angular/common':{DatePipe:class {}},
    '@angular/material/table':{MatTableModule:class {}},
    '@angular/material/button':{MatButtonModule:class {}},
    '@angular/material/icon':{MatIconModule:class {}},
    '@angular/router':{Router,RouterLink:class {}},
    '../../../services/rutinasservice':{Rutinasservice:Servicio},
    '../../../services/loginservice':{Loginservice:Auth},
    '../../../services/sesionesservice':{Sesionesservice:Sesiones},
    '../../../utils/errores':{mensajeDeError},
  },confirmar);
  const component = new Clistrutinascomponent();
  component.dataSource=[rutina(),rutina(2)];
  return {component,eliminacion,actualizacion,llamadas};
}

test('el servicio usa DELETE /rutinas/{id}', () => {
  class Http {}
  const solicitudes=[];
  const {Rutinasservice} = cargar('src/app/services/rutinasservice.ts',{
    '@angular/core':{Injectable:() => (clase) => clase,inject:() => ({delete:(url) => {solicitudes.push(url);return of(undefined);}})},
    '@angular/common/http':{HttpClient:Http},
    '../../environments/environment':{environment:{apiUrl:'http://api-qa.invalid'}},
  });
  new Rutinasservice().deleteRutina(12);
  assert.equal(solicitudes[0],'http://api-qa.invalid/rutinas/12');
});
test('cancelar la confirmación no envía DELETE', () => {
  const {component,llamadas}=listado(false);
  component.eliminarRutina(rutina());
  assert.equal(llamadas.eliminacion.length,0);
  assert.equal(component.operacionPendiente,false);
});
test('no elimina rutinas ajenas ni IDs ausentes del listado', () => {
  const {component,llamadas}=listado();
  component.dataSource=[rutina(1,99)];
  component.eliminarRutina(rutina(1,99));
  component.eliminarRutina(rutina(50));
  assert.equal(llamadas.eliminacion.length,0);
});
test('una eliminación pendiente bloquea repetición, inicio y cambio de estado', () => {
  const {component,llamadas}=listado();
  component.eliminarRutina(rutina());
  component.eliminarRutina(rutina());
  component.iniciarEntrenamiento(rutina(2));
  component.cambiarEstado(rutina(2));
  assert.equal(llamadas.eliminacion.length,1);
  assert.equal(llamadas.inicio.length,0);
  assert.equal(llamadas.actualizacion.length,0);
});
test('solo retira la tarjeta tras la confirmación del servidor', () => {
  const {component,eliminacion}=listado();
  component.eliminarRutina(rutina());
  assert.equal(component.dataSource.length,2);
  eliminacion.next();
  assert.equal(component.dataSource.length,1);
  assert.equal(component.dataSource[0].idRutina,2);
  assert.equal(component.operacionPendiente,false);
  assert.match(component.mensaje,/correctamente/);
});
test('un conflicto de relaciones conserva la rutina y propone desactivarla', () => {
  const {component,eliminacion}=listado();
  component.eliminarRutina(rutina());eliminacion.error({status:409});
  assert.equal(component.dataSource.length,2);
  assert.equal(component.operacionPendiente,false);
  assert.match(component.mensaje,/relacionados/);
  assert.match(component.mensaje,/desactivarla/);
});
test('un error de permisos conserva la rutina', () => {
  const {component,eliminacion}=listado();
  component.eliminarRutina(rutina());eliminacion.error({status:403});
  assert.equal(component.dataSource.length,2);
  assert.equal(component.eliminandoRutinaId,null);
  assert.match(component.mensaje,/permiso/);
});
test('se conserva desactivar/reactivar y se bloquea la eliminación simultánea', () => {
  const {component,actualizacion,llamadas}=listado();
  component.cambiarEstado(rutina());component.eliminarRutina(rutina(2));
  assert.equal(llamadas.actualizacion.length,1);
  assert.equal(llamadas.actualizacion[0][1].estado,false);
  assert.equal(llamadas.eliminacion.length,0);
  actualizacion.next(rutina());
  assert.equal(component.operacionPendiente,false);
});
