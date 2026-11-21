import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as rx from 'rxjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function cargar(relative, dependencias = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (n) => {
      if (n in dependencias) return dependencias[n];
      throw Error('Dependencia no declarada: ' + n);
    },
  });
  return exports;
}
const estadisticas = cargar('src/app/utils/estadisticas.ts');
const { graficosReporte, fechaReporte, agruparValores } = cargar('src/app/utils/reportes.ts', {
  './estadisticas': estadisticas,
});
const { recorrerPaginas } = cargar('src/app/utils/paginacion.ts', { rxjs: rx });
const pagina = (content, number, totalPages) => ({ content, number, totalPages });
test('el reporte completo recorre todas las páginas antes de emitir', async () => {
  const peticiones = [];
  const datos = await rx.firstValueFrom(
    recorrerPaginas((n) => {
      peticiones.push(n);
      return rx.of(pagina([{ id: n }], n, 3));
    }),
  );
  assert.equal(peticiones.join(','), '0,1,2');
  assert.equal(datos.length, 3);
});
test('la paginación acepta el formato Page de Spring y un historial vacío', async () => {
  const datos = await rx.firstValueFrom(
    recorrerPaginas((n) =>
      rx.of({ content: [], page: { number: n, totalPages: 0, size: 100, totalElements: 0 } }),
    ),
  );
  assert.equal(datos.length, 0);
});
test('un fallo en páginas posteriores no entrega un total parcial', async () => {
  await assert.rejects(
    rx.firstValueFrom(
      recorrerPaginas((n) =>
        n === 0 ? rx.of(pagina([1], 0, 2)) : rx.throwError(() => Error('Sin permiso')),
      ),
    ),
    /Sin permiso/,
  );
});
test('se rechazan respuestas sin paginación o páginas repetidas', async () => {
  for (const respuesta of [
    { content: [1] },
    { content: [1], number: 1, totalPages: 2 },
    { content: [], number: 0, totalPages: 2 },
  ])
    await assert.rejects(rx.firstValueFrom(recorrerPaginas(() => rx.of(respuesta))), /páginas/);
});
test('cancelar una consulta completa cancela la página pendiente', () => {
  const respuesta = new rx.Subject();
  const suscripcion = recorrerPaginas(() => respuesta).subscribe();
  assert.equal(respuesta.observers.length, 1);
  suscripcion.unsubscribe();
  assert.equal(respuesta.observers.length, 0);
});
test('fechas inválidas y ausentes no generan registros o puntos falsos', () => {
  assert.equal(fechaReporte('2026-02-30'), null);
  assert.equal(fechaReporte('2026-11-01T10:30:00'), '2026-11-01');
  const grafico = graficosReporte('sesiones', [
    { fecha: null, duracionMin: 20 },
    { fecha: '2026-11-01', duracionMin: null },
  ]);
  assert.equal(grafico[0].datos.length, 1);
  assert.equal(grafico[0].omitidos, 1);
  assert.equal(grafico[2].datos.length, 0);
});
test('los promedios conservan cero válido y omiten valores ausentes sin convertirlos', () => {
  const resultado = agruparValores(
    [
      { f: 'A', v: 0 },
      { f: 'A', v: 4 },
      { f: 'A', v: null },
      { f: 'A', v: '8' },
      { f: 'A', v: -1 },
    ],
    (r) => r.f,
    (r) => r.v,
    true,
  );
  assert.equal(resultado.datos[0].valor, 2);
  assert.equal(resultado.datos[0].etiqueta, 'A (n=2)');
  assert.equal(resultado.omitidos, 3);
});
test('la duración utiliza solo cierre real, nunca el estimado', () => {
  const graficos = graficosReporte('ciclos', [
    { idCiclo: 1, fechaInicio: '2026-10-01', fechaReal: '2026-10-28' },
    { idCiclo: 2, fechaInicio: '2026-11-01', fechaReal: null, fechaFinEstimada: '2026-11-29' },
    { idCiclo: 3, fechaInicio: '2026-11-20', fechaReal: '2026-11-01' },
  ]);
  assert.equal(graficos[1].datos.length, 1);
  assert.equal(graficos[1].datos[0].valor, 27);
  assert.equal(graficos[1].omitidos, 2);
});
test('los once módulos generan estados vacíos sin muestras ni ceros inventados', () => {
  for (const modulo of [
    'ciclos',
    'detalle-diario',
    'rutinas',
    'rutina-ejercicios',
    'sesiones',
    'detalle-sesion',
    'detalle-serie',
    'progreso',
    'perfiles',
    'recomendaciones',
    'catalogo',
  ])
    assert.ok(graficosReporte(modulo, []).every((g) => g.datos.length === 0));
});
test('los gráficos distinguen sesiones, series realizadas y planificación', () => {
  const serie = graficosReporte('detalle-serie', [
    { nombreEjercicio: 'Remo', repeticiones: 10 },
    { nombreEjercicio: 'Remo', repeticiones: 12 },
  ]);
  assert.equal(serie[0].datos[0].valor, 2);
  assert.equal(serie[1].datos[0].valor, 22);
  assert.equal(
    graficosReporte('rutina-ejercicios', [{ nombreEjercicio: 'Remo', series: 3 }])[0].datos[0]
      .valor,
    3,
  );
});
test('los estados desconocidos y medidas opcionales ausentes se mantienen explícitos', () => {
  assert.equal(
    graficosReporte('recomendaciones', [{ aceptada: null }])[0].datos[0].etiqueta,
    'Sin estado',
  );
  assert.equal(
    graficosReporte('progreso', [{ medidaOpcional: null }])[1].datos[0].etiqueta,
    'Sin medida opcional',
  );
});

function servicio(dobles) {
  const dependencias = {
    rxjs: rx,
    '@angular/core': { Injectable: () => (x) => x, inject: (token) => dobles[token.nombre] },
    '../utils/paginacion': { recorrerPaginas },
  };
  const nombres = {
    administracionservice: 'Administracionservice',
    ciclosservice: 'Ciclosservice',
    detallediariocicloservice: 'Detallediariocicloservice',
    rutinasservice: 'Rutinasservice',
    rutinaejerciciosservice: 'Rutinaejerciciosservice',
    sesionesservice: 'Sesionesservice',
    detallesesionservice: 'Detallesesionservice',
    detalleserieservice: 'Detalleserieservice',
    progresoservice: 'Progresoservice',
    perfilservice: 'Perfilservice',
    recomendacionesservice: 'Recomendacionesservice',
    ejerciciosservice: 'Ejerciciosservice',
    loginservice: 'Loginservice',
  };
  for (const [archivo, nombre] of Object.entries(nombres))
    dependencias['./' + archivo] = { [nombre]: { nombre } };
  const { Reportesservice } = cargar('src/app/services/reportesservice.ts', dependencias);
  return new Reportesservice();
}
test('ADMIN consulta solo sus endpoints y recorre todas las páginas', async () => {
  const llamadas = [];
  const s = servicio({
    Administracionservice: {
      listar: (modulo, cuenta, n, tamano) => {
        llamadas.push([modulo, cuenta, n, tamano]);
        return rx.of(pagina([{ idUsuario: 7, datos: { idProgreso: n, pesoKg: 60 } }], n, 2));
      },
    },
  });
  const datos = await rx.firstValueFrom(s.consultar('progreso', true, 7, null, ''));
  assert.equal(datos.registros.length, 2);
  assert.equal(llamadas[1].join(','), 'progreso,7,1,100');
});
test('USUARIA usa su ID de sesión para el JOIN de ejercicios', async () => {
  const llamadas = [];
  const s = servicio({
    Loginservice: { getIdUsuario: () => 5 },
    Rutinasservice: {
      getRutinasUsuario: (id) => {
        llamadas.push(id);
        return rx.of([]);
      },
    },
    Ejerciciosservice: {
      listarPorUsuario: (id) => {
        llamadas.push(id);
        return rx.of([{ nombreEjercicio: 'Remo', idUsuario: 5 }]);
      },
    },
  });
  const datos = await rx.firstValueFrom(s.consultar('rutina-ejercicios', false, 6, null, ''));
  assert.equal(llamadas.join(','), '5,5');
  assert.equal(datos.registros[0].idUsuario, 5);
});
test('las referencias inexistentes se rechazan antes de solicitar un detalle', async () => {
  const s = servicio({
    Loginservice: { getIdUsuario: () => 5 },
    Ciclosservice: { getCiclosUsuario: () => rx.of([{ idCiclo: 1, fechaInicio: '2026-11-01' }]) },
  });
  await assert.rejects(
    rx.firstValueFrom(s.consultar('ciclos', false, null, 2, '')),
    /no está disponible/,
  );
});
test('una serie que no se puede cargar impide mostrar un total parcial', async () => {
  const s = servicio({
    Loginservice: { getIdUsuario: () => 5 },
    Sesionesservice: {
      listarUsuario: () => rx.of([{ idSesion: 1, fecha: '2026-11-01', estado: 'EN_CURSO' }]),
    },
    Detallesesionservice: {
      listarPorSesion: () =>
        rx.of([
          { idDetalle: 1, nombre: 'Remo' },
          { idDetalle: 2, nombre: 'Sentadilla' },
        ]),
    },
    Detalleserieservice: {
      listarPorDetalle: (id) =>
        id === 1
          ? rx.of([{ idSerie: 1, repeticiones: 10 }])
          : rx.throwError(() => Error('Error de series')),
    },
  });
  await assert.rejects(
    rx.firstValueFrom(s.consultar('detalle-serie', false, null, 1, '')),
    /Error de series/,
  );
});
test('un perfil inexistente genera un estado vacío y un error de permisos se conserva', async () => {
  for (const status of [404, 403]) {
    const s = servicio({
      Loginservice: { getIdUsuario: () => 5 },
      Perfilservice: { getPerfil: () => rx.throwError(() => ({ status })) },
    });
    if (status === 404)
      assert.equal(
        (await rx.firstValueFrom(s.consultar('perfiles', false, null, null, ''))).registros.length,
        0,
      );
    else
      await assert.rejects(
        rx.firstValueFrom(s.consultar('perfiles', false, null, null, '')),
        (e) => e.status === 403,
      );
  }
});

function componente(core, consultar) {
  const servicio = { nombre: 'reportes' },
    admin = { nombre: 'admin' };
  const deps = {
    '@angular/core': {
      ...core,
      Component: () => (c) => c,
      Input: () => () => {},
      inject: (t) => (t === servicio ? { consultar } : {}),
    },
    '@angular/forms': { FormsModule: class {} },
    '@angular/core/rxjs-interop': { takeUntilDestroyed: () => (s) => s },
    rxjs: rx,
    '../../services/reportesservice': { Reportesservice: servicio },
    '../../services/administracionservice': { Administracionservice: admin },
    '../../utils/reportes': { fechaReporte, graficosReporte },
    '../../utils/errores': { mensajeDeError: () => 'No se pudo cargar el reporte completo.' },
    '../administracioncomponent/graficobarrascomponent/graficobarrascomponent': {
      Graficobarrascomponent: class {},
    },
    '../progresocomponent/graficoprogresocomponent/graficoprogresocomponent': {
      Graficoprogresocomponent: class {},
    },
  };
  const { Reportescomponent } = cargar(
    'src/app/components/reportescomponent/reportescomponent.ts',
    deps,
  );
  return new Reportescomponent();
}
test('la curva de progreso se actualiza al cambiar de reporte y mes con señales Angular reales', async () => {
  const core = await import('@angular/core');
  const respuestas = [];
  const c = componente(core, () => {
    const r = new rx.Subject();
    respuestas.push(r);
    return r;
  });
  c.ngOnInit();
  assert.equal(c.mediciones().length, 0);
  c.tipo = 'progreso';
  c.cambiarReporte();
  respuestas[1].next({
    registros: [{ idProgreso: 1, fecha: '2026-11-01', pesoKg: 60 }],
    referencias: [],
    referencia: null,
    grupos: [],
    detalle: '',
  });
  assert.equal(c.mediciones().length, 1);
  c.mes.set('2026-10');
  assert.equal(c.mediciones().length, 0);
  c.mes.set('2026-11');
  assert.equal(c.mediciones().length, 1);
});
test('cambiar de reporte cancela la respuesta anterior y un error no conserva cifras viejas', async () => {
  const core = await import('@angular/core');
  const respuestas = [];
  const c = componente(core, () => {
    const r = new rx.Subject();
    respuestas.push(r);
    return r;
  });
  c.ngOnInit();
  c.tipo = 'rutinas';
  c.cambiarReporte();
  assert.equal(respuestas[0].observers.length, 0);
  respuestas[0].next({ registros: [{ idCiclo: 1 }] });
  assert.equal(c.resultado(), null);
  respuestas[1].error({ status: 503 });
  assert.equal(c.resultado(), null);
  assert.ok(c.error());
  assert.equal(c.cargando(), false);
  c.cargar();
  respuestas[2].next({ registros: [], referencias: [], referencia: null, grupos: [], detalle: '' });
  assert.equal(c.error(), '');
  assert.equal(c.resultado().registros.length, 0);
});
