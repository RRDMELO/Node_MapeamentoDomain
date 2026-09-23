import { Notification } from "../../domain/entities/Notification";
import { INotificationService } from "../../services/INotificationService";

/**
 * Implementação de console para desenvolvimento/testes.
 * Substitua por implementação real com nodemailer, etc.
 */
export class ConsoleNotificationService implements INotificationService {
  async send(notification: Notification): Promise<void> {
    console.log(
      `[${notification.channel}] 📦 ${notification.productName}: ${notification.message}`,
    );
    notification.markAsSent();
  }
}
