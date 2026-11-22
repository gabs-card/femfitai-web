import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { Subject, of } from 'rxjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function cargar(relative, dependencias = {}) {
  const filename = path.join(root, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    output,
    {
      exports,
      require: (nombre) => {
        if (!(nombre in dependencias)) throw new Error(`Dependencia no declarada: ${nombre}`);
        return dependencias[nombre];
      },
    },
    { filename },
  );
  return exports;
}
const { contarPorCategoria, registrosPorMes } = cargar('src/app/utils/estadisticas.ts');
test('las categorías reflejan todos los registros, incluso campos ausentes', () => {
  const datos = contarPorCategoria(
    [{ tipo: 'Fuerza' }, { tipo: null }, { tipo: ' Fuerza ' }, { tipo: '' }],
    (r) => r.tipo,
  );
  assert.equal(
    datos.reduce((total, d) => total + d.valor, 0),
    4,
  );
  assert.equal(datos.find((d) => d.etiqueta === 'Fuerza').valor, 2);
  assert.equal(datos.find((d) => d.etiqueta === 'Sin especificar').valor, 2);
});
test('un listado vacío no genera categorías ni cifras de ejemplo', () => {
  assert.equal(contarPorCategoria([], () => null).length, 0);
  assert.equal(registrosPorMes([]).length, 0);
});
test('los registros mensuales se ordenan por año y mes sin rellenar periodos', () => {
  const datos = registrosPorMes([
    { fechaRegistro: '2026-11-01T12:00:00' },
    { fechaRegistro: '2025-12-01' },
    { fechaRegistro: '2026-11-20' },
  ]);
  assert.equal(datos.map((d) => d.etiqueta).join(','), '2025-12,2026-11');
  assert.equal(datos[1].valor, 2);
});
test('las fechas inexistentes, incompletas o ausentes no se cuentan', () => {
  const datos = registrosPorMes([
    { fechaRegistro: null },
    { fechaRegistro: '' },
    { fechaRegistro: '2026-13-01' },
    { fechaRegistro: '2026-02-30' },
    { fechaRegistro: '2024-02-29T10:00:00' },
  ]);
  assert.equal(datos.length, 1);
  assert.equal(datos[0].etiqueta, '2024-02');
});
test('las métricas no modifican los DTO de entrada', () => {
  const datos = [
    { fechaRegistro: '2026-11-01', tipo: 'Fuerza' },
    { fechaRegistro: '2025-01-01', tipo: 'Cardio' },
  ];
  const original = JSON.stringify(datos);
  registrosPorMes(datos);
  contarPorCategoria(datos, (d) => d.tipo);
  assert.equal(JSON.stringify(datos), original);
});
test('los métodos de catálogo usan los endpoints existentes', () => {
  const llamadas = [];
  const http = Object.fromEntries(
    ['get', 'post', 'put', 'delete'].map((metodo) => [
      metodo,
      (...args) => {
        llamadas.push({ metodo, args });
        return of({});
      },
    ]),
  );
  const { Ejerciciosservice } = cargar('src/app/services/ejerciciosservice.ts', {
    '@angular/core': { Injectable: () => (c) => c, inject: () => http },
    '@angular/common/http': { HttpClient: class {}, HttpParams: class {} },
    '../../environments/environment': { environment: { apiUrl: 'http://api-qa.invalid' } },
  });
  const service = new Ejerciciosservice();
  const dto = { idEjercicio: 3, nombre: 'Ejercicio QA' };
  service.listarEjercicios();
  service.getEjercicio(3);
  service.insertEjercicio(dto);
  service.updateEjercicio(3, dto);
  service.deleteEjercicio(3);
  assert.equal(llamadas.map((c) => c.metodo).join(','), 'get,get,post,put,delete');
  assert.equal(llamadas[1].args[0], 'http://api-qa.invalid/ejercicios/3');
  assert.equal(llamadas[3].args[1], dto);
  assert.equal(llamadas[4].args[0], 'http://api-qa.invalid/ejercicios/3');
});

function registro(administracion, adminAutenticado = true) {
  class Usuarios {}
  class Auth {}
  class Detector {}
  class Builder {}
  class Emisor {
    cantidad = 0;
    emit() {
      this.cantidad++;
    }
  }
  const respuesta = new Subject();
  const solicitudes = [];
  const instancias = new Map([
    [
      Usuarios,
      {
        registrar: (datos) => {
          solicitudes.push(datos);
          return respuesta;
        },
      },
    ],
    [Auth, { hasAnyRole: () => adminAutenticado }],
    [Detector, { detectChanges: () => {} }],
    [Builder, {}],
  ]);
  const decorador = () => () => {};
  const { Usuarioscomponent } = cargar(
    'src/app/components/usuarioscomponent/usuarioscomponent.ts',
    {
      '@angular/core': {
        Component: () => (c) => c,
        Input: decorador,
        Output: decorador,
        EventEmitter: Emisor,
        inject: (token) => instancias.get(token),
        ChangeDetectorRef: Detector,
      },
      '@angular/material/input': { MatInputModule: class {} },
      '@angular/material/form-field': { MatFormFieldModule: class {} },
      '@angular/material/button': { MatButton: class {} },
      '@angular/material/select': { MatSelectModule: class {} },
      '@angular/forms': { FormBuilder: Builder, ReactiveFormsModule: class {}, Validators: {} },
      '../../services/usuariosservices': { UsuariosService: Usuarios },
      '../../services/loginservice': { Loginservice: Auth },
    },
  );
  const component = new Usuarioscomponent();
  component.administracion = administracion;
  component.form = {
    invalid: false,
    value: {
      nombres: 'Nombre QA',
      apellidos: 'Prueba',
      correo: 'qa@example.com',
      passwordHash: 'SoloQA123',
      rol: 'ADMIN',
      estado: false,
    },
  };
  return { component, respuesta, solicitudes };
}
test('el registro público excluye rol y estado aunque se alteren los controles', () => {
  const { component, solicitudes } = registro(false);
  component.registrarUsuario();
  assert.equal(Object.hasOwn(solicitudes[0], 'rol'), false);
  assert.equal(Object.hasOwn(solicitudes[0], 'estado'), false);
});
test('el modo administrativo requiere una sesión ADMIN para enviar rol y estado', () => {
  const { component, solicitudes } = registro(true, false);
  component.registrarUsuario();
  assert.equal(Object.hasOwn(solicitudes[0], 'rol'), false);
});
test('ADMIN puede enviar rol y estado al endpoint de registro existente', () => {
  const { component, solicitudes } = registro(true, true);
  component.registrarUsuario();
  assert.equal(solicitudes[0].rol, 'ADMIN');
  assert.equal(solicitudes[0].estado, false);
});
test('crear una cuenta no inicia sesión y bloquea envíos repetidos', () => {
  const { component, solicitudes, respuesta } = registro(true, true);
  component.registrarUsuario();
  component.registrarUsuario();
  assert.equal(solicitudes.length, 1);
  assert.equal(component.guardando, true);
  respuesta.next({ idUsuario: 7 });
  assert.equal(component.cuentaCreada.cantidad, 1);
  assert.equal(component.guardando, false);
});
