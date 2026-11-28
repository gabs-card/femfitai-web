import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function cargar(relative, dependencias = {}) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true },
  }).outputText;
  vm.runInNewContext(output, { exports, URL, require: (nombre) => {
    if (!(nombre in dependencias)) throw new Error('Dependencia no declarada: '+nombre);
    return dependencias[nombre];
  } });
  return exports;
}
const imagenes = cargar('src/app/utils/imagenes.ts');
const { urlImagenSegura } = imagenes;

test('acepta enlaces HTTPS de imágenes y créditos sin alterar parámetros necesarios', () => {
  assert.equal(urlImagenSegura(' https://images.example.test/sentadilla.webp?version=2 '),
    'https://images.example.test/sentadilla.webp?version=2');
  assert.equal(urlImagenSegura('https://creativecommons.org/licenses/by/4.0/'),
    'https://creativecommons.org/licenses/by/4.0/');
});
test('un ejercicio antiguo sin imagen no recibe una foto inventada', () => {
  for (const value of [undefined, null, '', ' ']) assert.equal(urlImagenSegura(value), '');
});
test('impide fuentes ejecutables, locales, mixtas o con credenciales', () => {
  for (const value of ['javascript:alert(1)', 'data:image/png;base64,AA', 'file:///foto.jpg',
    'http://images.example.test/a.jpg', '//images.example.test/a.jpg', 'https:images.example.test/a.jpg',
    'https://usuario:clave@images.example.test/a.jpg', 'https://images.example.test/a.jpg#fragmento',
    'https://images.example.test/foto\n.jpg', 'https://', 'no es una URL'])
    assert.equal(urlImagenSegura(value), '', value);
});
test('rechaza URLs superiores al tamaño que admite la base', () => {
  assert.equal(urlImagenSegura('https://images.example.test/'+ 'a'.repeat(2048)), '');
});
const { Fotoejerciciocomponent } = cargar('src/app/components/fotoejerciciocomponent/fotoejerciciocomponent.ts', {
  '@angular/core': { Component: () => (c) => c, Input: () => () => {}, ViewChild: () => () => {} },
  '../../utils/imagenes': imagenes,
});
test('un fallo de carga se limpia al cambiar la fotografía', () => {
  const component = new Fotoejerciciocomponent();
  component.imagenFallida = true;
  component.imagenUrl = 'https://images.example.test/nueva.jpg';
  component.ngOnChanges();
  assert.equal(component.imagenFallida, false);
  assert.equal(component.fuente, component.imagenUrl);
});
test('el enlace de créditos y la imagen usan la misma política HTTPS', () => {
  const component = new Fotoejerciciocomponent();
  component.imagenUrl = 'javascript:alert(1)';
  component.licenciaUrl = 'javascript:alert(1)';
  assert.equal(component.fuente, ''); assert.equal(component.enlaceLicencia, '');
});

test('el visor solo abre imágenes HTTPS disponibles y permite cerrar', () => {
  const component = new Fotoejerciciocomponent();
  let aperturas = 0, cierres = 0;
  component.detalle = { nativeElement: { showModal: () => aperturas++, close: () => cierres++ } };
  component.abrir();
  component.imagenUrl = 'javascript:alert(1)'; component.abrir();
  assert.equal(aperturas, 0);
  component.imagenUrl = 'https://images.example.test/ilustracion.png'; component.abrir();
  assert.equal(aperturas, 1);
  component.imagenFallida = true; component.abrir();
  assert.equal(aperturas, 1);
  component.cerrar(); assert.equal(cierres, 1);
});

test('sincronizar usa POST del backend propio, sin llamar wger desde el navegador', () => {
  const llamadas = [];
  const { Ejerciciosservice } = cargar('src/app/services/ejerciciosservice.ts', {
    '@angular/core': { Injectable: () => (c) => c, inject: () => ({ post: (...args) => { llamadas.push(args); return 'solicitud'; } }) },
    '@angular/common/http': { HttpClient: class {}, HttpParams: class {} },
    '../../environments/environment': { environment: { apiUrl: 'https://api.example.test' } },
  });
  assert.equal(new Ejerciciosservice().sincronizarWger(), 'solicitud');
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0][0], 'https://api.example.test/ejercicios/wger/sincronizar');
});
