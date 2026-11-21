(() => {
  'use strict';
  const elegir = (selector) => document.querySelector(selector);
  const informar = (texto) => { elegir('.toast').textContent=texto; };
  const modal = elegir('#dialogo');
  let confirmarAccion;
  function confirmar(titulo,texto,accion) {
    elegir('#titulo-dialogo').textContent=titulo;
    elegir('#contenido-dialogo').innerHTML='<p id="texto-confirmacion"></p><p class="nota nota-panel">Solo datos de demostración. Al recargar se restablecen.</p><div class="acciones"><button class="boton" type="button" id="cancelar-demo">Cancelar</button><button class="boton principal" type="button" id="confirmar-demo">Confirmar en demo</button></div>';
    elegir('#texto-confirmacion').textContent=texto;
    confirmarAccion=accion;
    elegir('#cancelar-demo').onclick=()=>modal.close();
    elegir('#confirmar-demo').onclick=()=>{modal.close();confirmarAccion();};
    modal.showModal();
  }
  document.querySelectorAll('[data-medicion-demo]').forEach((boton)=>boton.addEventListener('click',()=>{
    document.querySelectorAll('[data-medicion-demo]').forEach((item)=>item.setAttribute('aria-pressed',String(item===boton)));
    document.querySelectorAll('[data-grafico-demo]').forEach((grupo)=>grupo.hidden=grupo.dataset.graficoDemo!==boton.dataset.medicionDemo);
  }));
  document.querySelectorAll('[data-estado-plan]').forEach((boton)=>boton.addEventListener('click',()=>{
    const tarjeta=boton.closest('[data-plan]');
    const activa=tarjeta.dataset.activa==='true';
    confirmar(activa?'Desactivar rutina demo':'Reactivar rutina demo','Esta acción cambia únicamente el estado de la tarjeta de ejemplo.',()=>{
      tarjeta.dataset.activa=String(!activa);
      const etiqueta=tarjeta.querySelector('[data-etiqueta-plan]');
      etiqueta.textContent=activa?'Inactiva':'Activa';etiqueta.className=`etiqueta ${activa?'gris':'verde'}`;
      boton.textContent=activa?'Reactivar':'Desactivar';
      tarjeta.querySelector('[data-iniciar-plan]').hidden=activa;
      informar('Estado cambiado solo en la demostración.');
    });
  }));
  document.querySelectorAll('[data-eliminar-plan]').forEach((boton)=>boton.addEventListener('click',()=>{
    const tarjeta=boton.closest('[data-plan]');
    confirmar('Eliminar rutina de ejemplo','La versión Angular pide confirmación antes de una eliminación permanente. Aquí solo retiramos la tarjeta ficticia.',()=>{
      if(tarjeta.dataset.relaciones==='true'){
        informar('Ejemplo de conflicto: esta rutina tiene registros relacionados. Puedes desactivarla.');return;
      }
      tarjeta.remove();informar('Tarjeta demo retirada. Recarga para restaurarla.');
    });
  }));
  document.querySelectorAll('[data-accion-visual]').forEach((boton)=>boton.addEventListener('click',()=>informar('Botón de referencia visual. Esta página no ejecuta operaciones de Angular ni de la API.')));
})();
