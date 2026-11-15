
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { Chatservice } from '../../services/chatservice';
import { ChatMessageDTO } from '../../models/ChatMessageDTO';

@Component({
  selector: 'app-chatcomponent',
  imports: [FormsModule],
  templateUrl: './chatcomponent.html',
  styleUrl: './chatcomponent.css',
})
export class Chatcomponent {

  mensajeActual = '';
private cdr = inject(ChangeDetectorRef);
  // Mensajes que se muestran en pantalla
  mensajes: ChatMessageDTO[] = [];

  // Historial que se envía a Gemini
  historial: ChatMessageDTO[] = [];

  cargando = false;
  error = '';

  constructor(private chatService: Chatservice) {}

  enviarMensaje(): void {

    const mensaje = this.mensajeActual.trim();

    if (!mensaje || this.cargando) {
      return;
    }

    this.error = '';
    this.mensajeActual = '';

    // Guardar el historial anterior antes de agregar el mensaje actual
    const historialAnterior = [...this.historial];

    // Mostrar el mensaje de la usuaria
    const mensajeUsuario: ChatMessageDTO = {
      role: 'user',
      content: mensaje
    };

    this.mensajes.push(mensajeUsuario);

    this.cargando = true;

    this.chatService.enviarMensaje({
      mensaje: mensaje,
      historial: historialAnterior
    }).subscribe({

     next: (respuesta) => {

  const mensajeIA: ChatMessageDTO = {
    role: 'model',
    content: respuesta.respuesta
  };

  this.mensajes.push(mensajeIA);

  this.historial.push(
    mensajeUsuario,
    mensajeIA
  );

  this.cargando = false;

  // Notificar a Angular que debe actualizar la vista
  this.cdr.markForCheck();
},
error: (err) => {

  console.error('Error en el chatbot:', err);

  if (err.status === 503 || err.status === 502) {
    this.error = 'Nuestro asistente está ocupado. Inténtalo nuevamente en unos momentos.';
  } else if (err.status === 401) {
    this.error = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  } else {
    this.error = 'No pudimos enviar tu mensaje. Inténtalo nuevamente.';
  }

  this.cargando = false;

  this.cdr.markForCheck();
}

    });
  }

  manejarEnter(event: KeyboardEvent): void {

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  usarSugerencia(texto: string): void {
    this.mensajeActual = texto;
  }

  nuevaConversacion(): void {

    this.mensajes = [];
    this.historial = [];
    this.error = '';
    this.mensajeActual = '';
  }
}
