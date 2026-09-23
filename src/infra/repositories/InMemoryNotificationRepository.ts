import { Notification } from "../../domain/entities/Notification";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

export class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.find((n) => n.id === id) ?? null;
  }

  async findByProductId(productId: string): Promise<Notification[]> {
    return this.notifications.filter((n) => n.productId === productId);
  }

  async save(notification: Notification): Promise<void> {
    this.notifications.push(notification);
  }

  async update(notification: Notification): Promise<void> {
    const idx = this.notifications.findIndex((n) => n.id === notification.id);
    if (idx === -1) throw new Error("Notification not found");
    this.notifications[idx] = notification;
  }
}
