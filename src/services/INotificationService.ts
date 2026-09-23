import { Notification } from "../domain/entities/Notification";

/**
 * Porta (interface de serviço) para envio de notificações.
 * Implementações concretas podem usar nodemailer, SendGrid, etc.
 */
export interface INotificationService {
  send(notification: Notification): Promise<void>;
}
