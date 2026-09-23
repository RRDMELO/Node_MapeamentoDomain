import { IPurchaseOrderRepository } from "../../domain/repositories/IPurchaseOrderRepository";
import { PurchaseOrder } from "../../domain/entities/PurchaseOrder";

export interface UpdateDeliveryForecastInput {
  orderId: string;
  estimatedDeliveryAt: Date;
}

/**
 * Caso de uso para integração com fornecedores:
 * Atualiza o prazo de entrega estimado de uma ordem de compra
 * quando o fornecedor envia uma atualização.
 */
export class UpdateDeliveryForecastUseCase {
  constructor(private purchaseOrderRepository: IPurchaseOrderRepository) {}

  async execute(input: UpdateDeliveryForecastInput): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(input.orderId);
    if (!order) throw new Error(`Purchase order ${input.orderId} not found`);

    order.updateEstimatedDelivery(input.estimatedDeliveryAt);
    await this.purchaseOrderRepository.update(order);

    return order;
  }
}
