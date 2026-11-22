'use strict';

// Prototipo aislado. No usa API, autenticación ni almacenamiento persistente.
const uno = (selector) => document.querySelector(selector);
const escapar = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const normalizar = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const iconos = {
  editar:'<path d="m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5"/>',
  borrar:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  ejercicio:'<path d="m6 6 12 12M3 8l5-5m8 18 5-5M2 5l3-3m14 20 3-3M6 11l5-5m2 12 5-5"/>',
};
const icono = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconos[name]}</svg>`;
const accion = (symbol, text, attrs) => `<button type="button" class="icono-boton" aria-label="${escapar(text)}" title="${escapar(text)}" ${attrs}>${icono(symbol)}</button>`;
let avisoTemporizador;
function avisar(texto) {
  uno('.toast').textContent = texto;
  clearTimeout(avisoTemporizador);
  avisoTemporizador = setTimeout(() => { uno('.toast').textContent = ''; }, 6500);
}

const dialogo = uno('#dialogo');
function abrirDialogo(titulo, contenido) {
  uno('#titulo-dialogo').textContent = titulo;
  uno('#contenido-dialogo').innerHTML = contenido;
  dialogo.showModal();
}
uno('[data-cerrar-dialogo]').addEventListener('click', () => dialogo.close());

function confirmar(titulo, texto, callback, textoBoton = 'Confirmar en demo') {
  abrirDialogo(titulo, `<p>${escapar(texto)}</p><p class="nota nota-panel">Esta acción solo afecta a los datos de demostración de esta página.</p><div class="acciones"><button class="boton" type="button" data-cancelar>Cancelar</button><button class="boton principal" type="button" data-confirmar>${escapar(textoBoton)}</button></div>`);
  uno('[data-cancelar]').addEventListener('click', () => dialogo.close());
  uno('[data-confirmar]').addEventListener('click', () => { dialogo.close(); callback(); });
}

const usuarios = [
  {id:1,nombres:'Lucía',apellidos:'Demo',correo:'lucia@example.com',rol:'USUARIA',estado:'activa',fecha:'20 nov 2026'},
  {id:2,nombres:'Valeria',apellidos:'Demo',correo:'valeria@example.com',rol:'USUARIA',estado:'activa',fecha:'17 nov 2026'},
  {id:3,nombres:'Administración',apellidos:'Demo',correo:'admin@example.com',rol:'ADMIN',estado:'activa',fecha:'12 nov 2026'},
  {id:4,nombres:'Camila',apellidos:'Demo',correo:'camila@example.com',rol:'USUARIA',estado:'inactiva',fecha:'08 oct 2026'},
  {id:5,nombres:'Andrea',apellidos:'Demo',correo:'andrea@example.com',rol:'USUARIA',estado:'activa',fecha:'18 sep 2026'},
  {id:6,nombres:'Elena',apellidos:'Demo',correo:'elena@example.com',rol:'USUARIA',estado:'activa',fecha:'04 sep 2026'},
  {id:7,nombres:'Martina',apellidos:'Demo',correo:'martina@example.com',rol:'USUARIA',estado:'inactiva',fecha:'08 ago 2026'},
  {id:8,nombres:'Paula',apellidos:'Demo',correo:'paula@example.com',rol:'USUARIA',estado:'activa',fecha:'02 jul 2026'},
];

function campo(nombre, etiqueta, valor = '', tipo = 'text', opciones = null) {
  const control = opciones
    ? `<select name="${nombre}">${opciones.map((opcion) => `<option${opcion === valor ? ' selected' : ''}>${escapar(opcion)}</option>`).join('')}</select>`
    : tipo === 'textarea'
      ? `<textarea name="${nombre}" maxlength="500" required>${escapar(valor)}</textarea>`
      : `<input name="${nombre}" type="${tipo}" value="${escapar(valor)}" required ${tipo === 'number' ? 'min="0" step="any"' : 'maxlength="120"'} autocomplete="off">`;
  return `<label class="campo${tipo === 'textarea' ? ' ancho-completo' : ''}">${escapar(etiqueta)} *${control}</label>`;
}

function formularioDialogo(titulo, campos, callback) {
  abrirDialogo(titulo, `<p>Ejemplo visual. No ingreses datos personales reales.</p><form id="formulario-dialogo"><div class="formulario">${campos}</div><div class="acciones"><button class="boton" type="button" data-cancelar>Cancelar</button><button class="boton principal" type="submit">Guardar en demo</button></div></form>`);
  uno('[data-cancelar]').addEventListener('click', () => dialogo.close());
  uno('#formulario-dialogo').addEventListener('submit', (event) => {
    event.preventDefault();
    const datos = Object.fromEntries(new FormData(event.currentTarget));
    dialogo.close();
    callback(datos);
  });
}

function dibujarUsuarios() {
  const busqueda = normalizar(uno('#buscar-usuario').value);
  const rol = uno('#filtrar-rol').value;
  const estado = uno('#filtrar-estado').value;
  const visibles = usuarios.filter((u) => normalizar(`${u.nombres} ${u.apellidos} ${u.correo}`).includes(busqueda) && (!rol || u.rol === rol) && (!estado || u.estado === estado));
  uno('#usuarios-filas').innerHTML = visibles.map((u) => `<tr><td><div class="celda-persona"><span class="avatar">${escapar(u.nombres[0] + u.apellidos[0])}</span><div><strong>${escapar(u.nombres)} ${escapar(u.apellidos)}</strong><small>ID de ejemplo · ${String(u.id).padStart(3,'0')}</small></div></div></td><td>${escapar(u.correo)}</td><td><span class="etiqueta ${u.rol === 'ADMIN' ? 'lila' : ''}">${u.rol}</span></td><td><span class="etiqueta ${u.estado === 'activa' ? 'verde' : 'gris'}">${u.estado === 'activa' ? 'Activa' : 'Inactiva'}</span></td><td>${u.fecha}</td><td>${accion('editar', `Editar cuenta demo de ${u.nombres}`, `data-editar-usuario="${u.id}"`)}${accion(u.estado === 'activa' ? 'borrar' : 'check', `${u.estado === 'activa' ? 'Desactivar' : 'Reactivar'} cuenta demo de ${u.nombres}`, `data-estado-usuario="${u.id}"`)}</td></tr>`).join('') || '<tr><td colspan="6" class="estado-vacio">No hay cuentas demo que coincidan. Prueba otros filtros.</td></tr>';
  uno('#cuenta-resultados').textContent = `Mostrando ${visibles.length} de ${usuarios.length} cuentas de demostración`;
  uno('[data-cuenta="total"]').textContent = usuarios.length;
  uno('[data-cuenta="activas"]').textContent = usuarios.filter((u) => u.estado === 'activa').length;
  uno('[data-cuenta="inactivas"]').textContent = usuarios.filter((u) => u.estado === 'inactiva').length;
  uno('[data-cuenta="admin"]').textContent = usuarios.filter((u) => u.rol === 'ADMIN').length;
}

if (uno('#usuarios-filas')) {
  for (const selector of ['#buscar-usuario','#filtrar-rol','#filtrar-estado']) uno(selector).addEventListener('input', dibujarUsuarios);
  dibujarUsuarios();
  uno('#usuarios-filas').addEventListener('click', (event) => {
    const editar = event.target.closest('[data-editar-usuario]');
    const cambiar = event.target.closest('[data-estado-usuario]');
    if (editar) {
      const u = usuarios.find((item) => item.id === Number(editar.dataset.editarUsuario));
      formularioDialogo('Editar cuenta de ejemplo', campo('nombres','Nombres',u.nombres) + campo('apellidos','Apellidos',u.apellidos) + campo('correo','Correo',u.correo,'email'), (datos) => {
        Object.assign(u,datos); dibujarUsuarios(); avisar('Cuenta demo actualizada. No se enviaron datos al servidor.');
      });
    }
    if (cambiar) {
      const u = usuarios.find((item) => item.id === Number(cambiar.dataset.estadoUsuario));
      if (u.rol === 'ADMIN') { avisar('La demo protege la cuenta de administración de ejemplo.'); return; }
      const activa = u.estado === 'activa';
      confirmar(`${activa ? 'Desactivar' : 'Reactivar'} cuenta de ejemplo`, `¿Quieres ${activa ? 'desactivar' : 'reactivar'} a ${u.nombres} ${u.apellidos} en esta demostración?`, () => {
        u.estado = activa ? 'inactiva' : 'activa'; dibujarUsuarios(); avisar('Estado actualizado únicamente en la demostración.');
      });
    }
  });
}

if (uno('#formulario-usuario')) uno('#formulario-usuario').addEventListener('submit', (event) => {
  event.preventDefault();
  const datos = Object.fromEntries(new FormData(event.currentTarget));
  abrirDialogo('Así se vería la nueva cuenta', `<div class="nota-panel"><h3>${escapar(datos.nombres)} ${escapar(datos.apellidos)}</h3><p>${escapar(datos.correo)}</p><span class="etiqueta">${escapar(datos.rol)}</span> <span class="etiqueta verde">${escapar(datos.estado)}</span></div><p class="nota" style="margin-top:18px">Esta cuenta no se creó ni se añadió al listado. Es una previsualización para validar el formulario.</p><div class="acciones"><button type="button" class="boton principal" data-listo>Entendido</button></div>`);
  uno('[data-listo]').addEventListener('click', () => dialogo.close());
});

let ejercicios = [
  {id:1,nombre:'Sentadilla · demo',tipo:'Fuerza',grupo:'Piernas',descripcion:'Ejemplo de ficha para organizar el catálogo.'},
  {id:2,nombre:'Remo con mancuerna · demo',tipo:'Fuerza',grupo:'Espalda',descripcion:'Descripción de demostración, pendiente de contenido autorizado.'},
  {id:3,nombre:'Movilidad de cadera · demo',tipo:'Movilidad',grupo:'Piernas',descripcion:'Ejemplo visual de una actividad de movilidad.'},
  {id:4,nombre:'Caminata · demo',tipo:'Cardio',grupo:'Cuerpo completo',descripcion:'Una ficha breve, con acciones claras y visibles.'},
  {id:5,nombre:'Puente de glúteos · demo',tipo:'Fuerza',grupo:'Glúteos',descripcion:'Texto de ejemplo para revisar la jerarquía de información.'},
  {id:6,nombre:'Movilidad de hombros · demo',tipo:'Movilidad',grupo:'Hombros',descripcion:'Ilustración del catálogo, sin instrucciones de ejecución.'},
];
function dibujarEjercicios() {
  const query = normalizar(uno('#buscar-ejercicio').value);
  const tipo = uno('#filtrar-tipo').value;
  const visibles = ejercicios.filter((e) => normalizar(e.nombre + e.grupo).includes(query) && (!tipo || e.tipo === tipo));
  uno('#ejercicios-tarjetas').innerHTML = visibles.map((e) => `<article class="tarjeta"><div class="ejercicio-visual ${e.tipo === 'Movilidad' ? 'verde' : e.tipo === 'Cardio' ? 'lila' : ''}">${icono('ejercicio')}</div><span class="etiqueta">${escapar(e.tipo)}</span><h3 style="margin-top:14px">${escapar(e.nombre)}</h3><p class="nota">${escapar(e.descripcion)}</p><div class="ejercicio-pie"><span>${escapar(e.grupo)}</span><div>${accion('editar',`Editar ${e.nombre}`,`data-editar-ejercicio="${e.id}"`)}${accion('borrar',`Eliminar ${e.nombre}`,`data-borrar-ejercicio="${e.id}"`)}</div></div></article>`).join('') || '<p class="estado-vacio">No hay ejercicios demo que coincidan con tu búsqueda.</p>';
}
function editarEjercicio(id) {
  const actual = ejercicios.find((e) => e.id === id);
  formularioDialogo(actual ? 'Editar ejercicio demo' : 'Nuevo ejercicio demo', campo('nombre','Nombre',actual?.nombre ?? '') + campo('tipo','Tipo',actual?.tipo ?? 'Fuerza','text',['Fuerza','Cardio','Movilidad']) + campo('grupo','Grupo muscular',actual?.grupo ?? 'Piernas','text',['Piernas','Glúteos','Pecho','Espalda','Hombros','Brazos','Core','Cuerpo completo']) + campo('descripcion','Descripción',actual?.descripcion ?? '', 'textarea'), (datos) => {
    if (actual) Object.assign(actual,datos);
    else ejercicios.push({id:Math.max(0,...ejercicios.map((e) => e.id))+1,...datos});
    dibujarEjercicios(); avisar('Ejercicio guardado solo en la demostración.');
  });
}
if (uno('#ejercicios-tarjetas')) {
  uno('#buscar-ejercicio').addEventListener('input', dibujarEjercicios);
  uno('#filtrar-tipo').addEventListener('change', dibujarEjercicios);
  uno('[data-nuevo-ejercicio]').addEventListener('click', () => editarEjercicio(null));
  uno('#ejercicios-tarjetas').addEventListener('click', (event) => {
    const editar = event.target.closest('[data-editar-ejercicio]');
    const borrar = event.target.closest('[data-borrar-ejercicio]');
    if (editar) editarEjercicio(Number(editar.dataset.editarEjercicio));
    if (borrar) confirmar('Eliminar ejercicio demo', 'Este ejemplo representa la confirmación antes de eliminar. En Angular se comprobarán las relaciones y restricciones del backend.', () => {
      ejercicios = ejercicios.filter((e) => e.id !== Number(borrar.dataset.borrarEjercicio)); dibujarEjercicios(); avisar('Ejercicio eliminado únicamente de esta demo.');
    });
  });
  dibujarEjercicios();
}

// Campos para discutir el diseño, basados en los DTO existentes.
// No son contratos de API ni conceden permisos de administración.
const relacionUsuario = ['Lucía Demo · #1','Valeria Demo · #2'];
const relacionRutina = ['Fuerza demo · #1','Movilidad demo · #2'];
const relacionEjercicio = ['Sentadilla demo · #1','Remo demo · #2'];
const relacionCiclo = ['Ciclo demo · #1','Ciclo demo · #2'];
const relacionSesion = ['Sesión demo · #1','Sesión demo · #2'];
const relacionDetalle = ['Detalle de sesión demo · #1','Detalle de sesión demo · #2'];
const f = (name,label,value,type='text',options=null) => ({name,label,value,type,options});
const modulos = [
  { nombre:'Rutinas', descripcion:'Plan, objetivo y nivel de entrenamiento.', relacion:'Una rutina se asocia a una usuaria. Sus ejercicios se gestionan en la relación Rutina–Ejercicio.', campos:[f('nombre','Nombre','Fuerza demo'),f('usuario','Usuaria',relacionUsuario[0],'text',relacionUsuario),f('objetivo','Objetivo','Fuerza'),f('nivel','Nivel','Inicial','text',['Inicial','Intermedio','Avanzado'])] },
  { nombre:'Rutina–Ejercicio', descripcion:'Ejercicios que componen cada rutina.', relacion:'Relaciona una rutina con un ejercicio del catálogo. Los selectores reemplazan la escritura manual de los IDs.', campos:[f('rutina','Rutina',relacionRutina[0],'text',relacionRutina),f('ejercicio','Ejercicio',relacionEjercicio[0],'text',relacionEjercicio),f('series','Series','3','number'),f('repeticiones','Repeticiones','10','number'),f('descanso','Descanso (segundos)','60','number')] },
  { nombre:'Sesiones', descripcion:'Registro de una sesión de entrenamiento.', relacion:'Una sesión pertenece a una usuaria y está asociada a una rutina.', campos:[f('usuario','Usuaria',relacionUsuario[0],'text',relacionUsuario),f('rutina','Rutina',relacionRutina[0],'text',relacionRutina),f('fecha','Fecha','2026-11-20','date'),f('duracion','Duración (minutos)','35','number'),f('estado','Estado','Finalizada','text',['Iniciada','Finalizada'])] },
  { nombre:'Detalle de sesión', descripcion:'Ejercicios registrados durante una sesión.', relacion:'Selecciona una sesión y un ejercicio. Las series asociadas se revisan en su propio detalle.', campos:[f('sesion','Sesión',relacionSesion[0],'text',relacionSesion),f('ejercicio','Ejercicio',relacionEjercicio[0],'text',relacionEjercicio),f('observacion','Observación','Observación de demostración','textarea')] },
  { nombre:'Series', descripcion:'Repeticiones y peso de cada serie registrada.', relacion:'Una serie pertenece a un detalle de sesión; no se crea sin esa relación.', campos:[f('detalle','Detalle de sesión',relacionDetalle[0],'text',relacionDetalle),f('numero','Número de serie','1','number'),f('repeticiones','Repeticiones','10','number'),f('peso','Peso (kg)','5','number')] },
  { nombre:'Ciclos', descripcion:'Fechas registradas por la usuaria.', relacion:'El ciclo pertenece a una usuaria. La administración no obtiene acceso a esta información por aparecer en esta propuesta.', campos:[f('usuario','Usuaria',relacionUsuario[0],'text',relacionUsuario),f('inicio','Fecha de inicio','2026-11-01','date'),f('fin','Fin estimado','2026-11-28','date')] },
  { nombre:'Diario del ciclo', descripcion:'Registro diario y observaciones.', relacion:'Cada entrada del diario pertenece a un ciclo. Su consulta debe respetar la propiedad del registro.', campos:[f('ciclo','Ciclo',relacionCiclo[0],'text',relacionCiclo),f('fecha','Fecha','2026-11-20','date'),f('fase','Fase registrada','Fase de ejemplo'),f('observaciones','Observaciones','Nota de demostración','textarea')] },
  { nombre:'Progreso', descripcion:'Mediciones y notas personales.', relacion:'Cada registro de progreso pertenece a una usuaria; solo podrán aplicarse las operaciones autorizadas por la API.', campos:[f('usuario','Usuaria',relacionUsuario[0],'text',relacionUsuario),f('fecha','Fecha','2026-11-20','date'),f('peso','Peso (kg)','65','number'),f('nota','Nota personal','Registro de demostración','textarea')] },
  { nombre:'Perfiles', descripcion:'Preferencias para organizar el entrenamiento.', relacion:'Cada perfil está asociado a una usuaria. Se conservará el flujo de perfil personal existente.', campos:[f('usuario','Usuaria',relacionUsuario[0],'text',relacionUsuario),f('nivel','Nivel','Inicial','text',['Inicial','Intermedio','Avanzado']),f('objetivo','Objetivo principal','Fuerza'),f('dias','Días disponibles','3','number'),f('tiempo','Tiempo disponible (min)','40','number')] },
  { nombre:'Recomendaciones', descripcion:'Diseño exploratorio para recomendaciones.', relacion:'Las recomendaciones pertenecen a una usuaria y pueden vincularse a una rutina. Crear, editar o eliminar manualmente requiere confirmar las operaciones disponibles; actualmente existe un flujo de generación y aceptación.', campos:[f('usuario','Usuaria',relacionUsuario[0],'text',relacionUsuario),f('rutina','Rutina',relacionRutina[0],'text',relacionRutina),f('tipo','Tipo','Ejemplo visual'),f('contenido','Contenido','Texto de demostración, no es una recomendación de IA.','textarea')] },
];
modulos.forEach((modulo) => { modulo.filas = [{id:1,...Object.fromEntries(modulo.campos.map((c) => [c.name,c.value]))}]; });
let moduloActivo = 0;
function dibujarModulo() {
  const modulo = modulos[moduloActivo];
  uno('#modulos-pestanas').innerHTML = modulos.map((m,i) => `<button type="button" aria-pressed="${i === moduloActivo}" data-modulo="${i}">${m.nombre}</button>`).join('');
  uno('#modulo-titulo').textContent = modulo.nombre;
  uno('#modulo-descripcion').textContent = modulo.descripcion;
  uno('#modulo-relaciones').textContent = modulo.relacion;
  uno('#modulo-columnas').innerHTML = `<tr><th>ID demo</th>${modulo.campos.map((c) => `<th>${escapar(c.label)}</th>`).join('')}<th>Acciones</th></tr>`;
  uno('#modulo-filas').innerHTML = modulo.filas.map((fila) => `<tr><td>#${fila.id}</td>${modulo.campos.map((c) => `<td>${escapar(fila[c.name])}</td>`).join('')}<td>${accion('editar','Editar registro demo',`data-editar-registro="${fila.id}"`)}${accion('borrar','Eliminar registro demo',`data-borrar-registro="${fila.id}"`)}</td></tr>`).join('') || `<tr><td class="estado-vacio" colspan="${modulo.campos.length+2}">Sin registros demo. Puedes crear uno para revisar el formulario.</td></tr>`;
  uno('#modulo-conteo').textContent = `${modulo.filas.length} registro(s) de demostración`;
}
function editarRegistro(id) {
  const modulo = modulos[moduloActivo];
  const actual = modulo.filas.find((fila) => fila.id === id);
  formularioDialogo(`${actual ? 'Editar' : 'Crear'} · ${modulo.nombre} · demo`, modulo.campos.map((c) => campo(c.name,c.label,actual?.[c.name] ?? '',c.type,c.options)).join(''), (datos) => {
    if (actual) Object.assign(actual,datos);
    else modulo.filas.push({id:Math.max(0,...modulo.filas.map((fila) => fila.id))+1,...datos});
    dibujarModulo(); avisar('Registro guardado solo en la demostración.');
  });
}
if (uno('#modulos-pestanas')) {
  uno('#modulos-pestanas').addEventListener('click', (event) => {
    const boton = event.target.closest('[data-modulo]');
    if (!boton) return;
    moduloActivo = Number(boton.dataset.modulo);
    dibujarModulo();
    const activo = uno(`[data-modulo="${moduloActivo}"]`);
    activo.focus({preventScroll:true});
    activo.scrollIntoView({block:'nearest',inline:'nearest'});
  });
  uno('[data-nuevo-registro]').addEventListener('click', () => editarRegistro(null));
  uno('#modulo-filas').addEventListener('click', (event) => {
    const editar = event.target.closest('[data-editar-registro]');
    const borrar = event.target.closest('[data-borrar-registro]');
    if (editar) editarRegistro(Number(editar.dataset.editarRegistro));
    if (borrar) confirmar('Eliminar registro de ejemplo', 'En la aplicación real se validarán la propiedad del registro y sus relaciones antes de permitir esta operación.', () => {
      const modulo = modulos[moduloActivo];
      modulo.filas = modulo.filas.filter((fila) => fila.id !== Number(borrar.dataset.borrarRegistro));
      dibujarModulo(); avisar('Registro eliminado únicamente del ejemplo.');
    });
  });
  dibujarModulo();
}

uno('[data-exportar]')?.addEventListener('click', () => {
  const contenido = '\uFEFFDATOS DE DEMOSTRACION - NO API\r\nMes;Cuentas nuevas demo;Sesiones demo\r\nJunio;0;2\r\nJulio;1;3\r\nAgosto;1;4\r\nSeptiembre;2;3\r\nOctubre;1;5\r\nNoviembre;3;7\r\n';
  const url = URL.createObjectURL(new Blob([contenido],{type:'text/csv;charset=utf-8'}));
  const enlace = document.createElement('a');
  enlace.href = url; enlace.download = 'femfitai-datos-demostracion.csv';
  document.body.append(enlace); enlace.click(); enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  avisar('Se exportó un CSV con datos de demostración, no de la API.');
});

uno('[data-registro-personal]')?.addEventListener('click', () => {
  formularioDialogo('Registro personal · demo', campo('fecha','Fecha','2026-11-20','date') + campo('peso','Peso (kg)','','number') + campo('nota','Nota personal','','textarea'), () => {
    avisar('Formulario revisado. Los gráficos siguen usando el ejemplo fijo; no se guardaron datos reales.');
  });
});
