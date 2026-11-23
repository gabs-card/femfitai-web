import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import * as rx from 'rxjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function cargar(relative, deps = {}) {
  const filename = path.join(root, relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    code,
    {
      exports,
      confirm: () => true,
      require: (id) => {
        if (!(id in deps)) throw Error('Dependencia no declarada: ' + id);
        return deps[id];
      },
    },
    { filename },
  );
  return exports;
}
class Params {
  valores = {};
  set(k, v) {
    this.valores[k] = v;
    return this;
  }
}
function servicio(responder) {
  const llamadas = [];
  const http = Object.fromEntries(
    ['get', 'post', 'put', 'delete'].map((method) => [
      method,
      (...args) => {
        llamadas.push({ method, args });
        return responder(method, ...args);
      },
    ]),
  );
  const { Administracionservice } = cargar('src/app/services/administracionservice.ts', {
    '@angular/core': { Injectable: () => (c) => c, inject: () => http },
    '@angular/common/http': { HttpClient: class {}, HttpParams: Params },
    '../../environments/environment': { environment: { apiUrl: 'http://qa.invalid' } },
    rxjs: rx,
  });
  return { service: new Administracionservice(), llamadas };
}
test('los selectores recorren todas las páginas y conservan el filtro de cuenta', async () => {
  const { service, llamadas } = servicio((method, url, options) =>
    rx.of({
      content: [{ idUsuario: 7, datos: { idCiclo: Number(options.params.valores.pagina) + 1 } }],
      page: { totalPages: 3 },
    }),
  );
  const registros = await rx.lastValueFrom(service.opciones('ciclos', 7));
  assert.equal(registros.length, 3);
  assert.equal(llamadas.length, 3);
  assert.equal(llamadas.map((c) => c.args[1].params.valores.pagina).join(','), '0,1,2');
  assert(
    llamadas.every(
      (c) => c.args[1].params.valores.idUsuario === 7 && c.args[1].params.valores.tamano === 100,
    ),
  );
});
test('un selector deja de consultar si el backend devuelve una página vacía', async () => {
  const { service, llamadas } = servicio(() => rx.of({ content: [], totalPages: 200 }));
  assert.equal((await rx.lastValueFrom(service.opciones('rutinas', null))).length, 0);
  assert.equal(llamadas.length, 1);
});
test('un fallo en una página de referencias se propaga y no presenta un selector incompleto', async () => {
  const { service } = servicio((method, url, options) =>
    options.params.valores.pagina
      ? rx.throwError(() => ({ status: 503 }))
      : rx.of({ content: [{ datos: {} }], totalPages: 2 }),
  );
  await assert.rejects(rx.lastValueFrom(service.opciones('rutinas', 7)), (e) => e.status === 503);
});
test('crear editar y eliminar usan el espacio administrativo y el ID de la ruta', () => {
  const { service, llamadas } = servicio(() => rx.of({}));
  service.guardar('progreso', null, { idUsuario: 7, pesoKg: 60 });
  service.guardar('progreso', 9, { idUsuario: 7, pesoKg: 61 });
  service.eliminar('progreso', 9);
  assert.equal(llamadas.map((c) => c.method).join(','), 'post,put,delete');
  assert.equal(llamadas[0].args[0], 'http://qa.invalid/administracion/progreso');
  assert.equal(llamadas[1].args[0], 'http://qa.invalid/administracion/progreso/9');
  assert.equal(llamadas[2].args[0], llamadas[1].args[0]);
});

function pantalla(admin = true) {
  class Admin {}
  class Ejercicios {}
  class Auth {}
  class Route {}
  class Detector {}
  class Destroy {}
  class Control {
    constructor(value) {
      this.value = value;
    }
    disable() {}
    enable() {}
  }
  class Group {
    constructor(controls) {
      this.controls = controls;
    }
  }
  const respuesta = new rx.Subject(),
    llamadas = [];
  const service = {
    guardar: (...args) => {
      llamadas.push(args);
      return respuesta;
    },
    eliminar: (...args) => {
      llamadas.push(args);
      return respuesta;
    },
  };
  const instances = new Map([
    [Admin, service],
    [Ejercicios, {}],
    [Auth, { hasAnyRole: () => admin }],
    [Route, {}],
    [Detector, { detectChanges() {}, markForCheck() {} }],
    [Destroy, {}],
  ]);
  const catalogo = cargar(
    'src/app/components/administracioncomponent/gestionadmincomponent/modulos-administracion.ts',
  );
  const errores = cargar('src/app/utils/errores.ts');
  const { Gestionadmincomponent } = cargar(
    'src/app/components/administracioncomponent/gestionadmincomponent/gestionadmincomponent.ts',
    {
      '@angular/core': {
        Component: () => (c) => c,
        ChangeDetectorRef: Detector,
        DestroyRef: Destroy,
        inject: (token) => instances.get(token),
      },
      '@angular/forms': {
        FormControl: Control,
        FormGroup: Group,
        ReactiveFormsModule: class {},
        Validators: {},
      },
      '@angular/router': { ActivatedRoute: Route, RouterLink: class {} },
      '../../iconoaccioncomponent/iconoaccioncomponent': { Iconoaccioncomponent: class {} },
      '@angular/core/rxjs-interop': { takeUntilDestroyed: () => (observable) => observable },
      rxjs: rx,
      '../../../services/administracionservice': { Administracionservice: Admin },
      '../../../services/ejerciciosservice': { Ejerciciosservice: Ejercicios },
      '../../../services/loginservice': { Loginservice: Auth },
      '../../../utils/errores': errores,
      './modulos-administracion': catalogo,
    },
  );
  const component = new Gestionadmincomponent();
  component.modulo = catalogo.MODULOS_ADMINISTRACION.find((m) => m.clave === 'progreso');
  component.idEdicion = 9;
  component.editorAbierto = true;
  component.formulario = {
    invalid: false,
    getRawValue: () => ({
      idUsuario: 7,
      fecha: '2026-01-01',
      pesoKg: 61.25,
      medidaOpcional: '',
      notaPersonal: '  Nota real  ',
    }),
  };
  return { component, respuesta, llamadas };
}
test('guardar conserva propietario y decimales y permite vaciar campos opcionales', () => {
  const { component, llamadas } = pantalla();
  component.guardar();
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0][1], 9);
  assert.deepEqual(JSON.parse(JSON.stringify(llamadas[0][2])), {
    idUsuario: 7,
    fecha: '2026-01-01',
    pesoKg: 61.25,
    medidaOpcional: null,
    notaPersonal: 'Nota real',
  });
});
test('doble clic en guardar produce una única petición pendiente', () => {
  const { component, llamadas } = pantalla();
  component.guardar();
  component.guardar();
  assert.equal(llamadas.length, 1);
  assert.equal(component.guardando, true);
});
test('un error de relaciones conserva el formulario y permite corregirlo', () => {
  const { component, respuesta } = pantalla();
  component.guardar();
  respuesta.error({ status: 409, error: { message: 'Ya existe un registro para esta fecha' } });
  assert.equal(component.guardando, false);
  assert.equal(component.editorAbierto, true);
  assert.match(component.mensajeEditor, /Ya existe/);
});
test('una sesión no administrativa no puede guardar ni eliminar desde el componente', () => {
  const { component, llamadas } = pantalla(false);
  component.guardar();
  component.eliminar({ modificable: true, idUsuario: 7, datos: { idProgreso: 9 } });
  assert.equal(llamadas.length, 0);
});
test('los registros históricos no se eliminan aunque se invoque la acción directamente', () => {
  const { component, llamadas } = pantalla();
  component.eliminar({ modificable: false, idUsuario: 7, datos: { idProgreso: 9 } });
  assert.equal(llamadas.length, 0);
});
test('crear desde una página posterior vuelve a la primera para mostrar el registro nuevo', () => {
  const { component, respuesta } = pantalla();
  component.idEdicion = null;
  component.pagina = 4;
  component.guardar();
  respuesta.next({});
  assert.equal(component.pagina, 0);
  assert.equal(component.editorAbierto, false);
  assert.match(component.mensaje, /guardados correctamente/);
});
