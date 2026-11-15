export interface ChatMessageDTO {
    role: 'user' | 'model';
    content: string;
}