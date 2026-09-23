import { PurchaseOrder } from "../../domain/entities/PurchaseOrder";
import { IPurchaseOrderRepository } from "../../domain/repositories/IPurchaseOrderRepository";

export class InMemoryPurchaseOrderRepository implements IPurchaseOrderRepository {
  private orders: Map<string, PurchaseOrder> = new Map();

  async findById(id: string): Promise<PurchaseOrder | null> {
    return this.orders.get(id) ?? null;
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return Array.from(this.orders.values());
  }

  async findBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.supplierId === supplierId,
    );
  }

  async save(order: PurchaseOrder): Promise<void> {
    this.orders.set(order.id, order);
  }

  async update(order: PurchaseOrder): Promise<void> {
    if (!this.orders.has(order.id)) throw new Error("Purchase order not found");
    this.orders.set(order.id, order);
  }
}
