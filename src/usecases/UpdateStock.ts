import { randomUUID } from "crypto";
import {
  StockMovement,
  MovementType,
} from "../../domain/entities/StockMovement";
import { Notification } from "../../domain/entities/Notification";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { IStockMovementRepository } from "../../domain/repositories/IStockMovementRepository";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { INotificationService } from "../services/INotificationService";

export interface UpdateStockInput {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  referenceId?: string;
}

export class UpdateStockUseCase {
  constructor(
    private productRepository: IProductRepository,
    private stockMovementRepository: IStockMovementRepository,
    private notificationRepository: INotificationRepository,
    private notificationService: INotificationService,
  ) {}

  async execute(input: UpdateStockInput): Promise<StockMovement> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) throw new Error(`Product ${input.productId} not found`);

    // Calcula nova quantidade
    let newQuantity = product.quantity;
    if (input.type === "IN") {
      newQuantity += input.quantity;
    } else if (input.type === "OUT") {
      if (input.quantity > product.quantity) {
        throw new Error("Insufficient stock");
      }
      newQuantity -= input.quantity;
    } else {
      newQuantity = input.quantity; // ADJUSTMENT
    }

    product.updateQuantity(newQuantity);
    await this.productRepository.update(product);

    // Registra movimentação
    const movement = new StockMovement({
      id: randomUUID(),
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      referenceId: input.referenceId,
      createdAt: new Date(),
    });
    await this.stockMovementRepository.save(movement);

    // Verifica estoque baixo e dispara alertas
    if (product.isLowStock()) {
      const channels: Array<"EMAIL" | "SYSTEM"> = ["EMAIL", "SYSTEM"];
      for (const channel of channels) {
        const notification = new Notification({
          id: randomUUID(),
          productId: product.id,
          productName: product.name,
          channel,
          message: `Alerta: O estoque do produto "${product.name}" está baixo (${product.quantity} unidades). Mínimo definido: ${product.minimumStock}.`,
          status: "PENDING",
          createdAt: new Date(),
        });
        await this.notificationRepository.save(notification);
        await this.notificationService.send(notification);
      }
    }

    return movement;
  }
}
