
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { ChatRequestDTO } from '../models/ChatRequestDTO';
import { ChatResponseDTO } from '../models/ChatResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class Chatservice {

  private http = inject(HttpClient);

  private apiURL = `${environment.apiUrl}/ia/chat`;

  enviarMensaje(
    request: ChatRequestDTO
  ): Observable<ChatResponseDTO> {

    return this.http.post<ChatResponseDTO>(
      this.apiURL,
      request
    );
  }
}
