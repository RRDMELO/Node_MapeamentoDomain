import { randomUUID } from "crypto";
import {
  PurchaseOrder,
  PurchaseOrderItem,
} from "../../domain/entities/PurchaseOrder";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { IPurchaseOrderRepository } from "../../domain/repositories/IPurchaseOrderRepository";

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export class CreatePurchaseOrderUseCase {
  constructor(
    private productRepository: IProductRepository,
    private purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  async execute(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const orderItems: PurchaseOrderItem[] = [];

    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
      });
    }

    const now = new Date();
    const order = new PurchaseOrder({
      id: randomUUID(),
      supplierId: input.supplierId,
      items: orderItems,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

    await this.purchaseOrderRepository.save(order);
    return order;
  }
}
