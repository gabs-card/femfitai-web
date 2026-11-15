import { ChatMessageDTO } from './ChatMessageDTO';

export interface ChatRequestDTO {
    mensaje: string;
    historial: ChatMessageDTO[];
}