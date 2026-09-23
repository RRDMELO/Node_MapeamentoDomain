import { Notification } from "../entities/Notification";

export interface INotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByProductId(productId: string): Promise<Notification[]>;
  save(notification: Notification): Promise<void>;
  update(notification: Notification): Promise<void>;
}
