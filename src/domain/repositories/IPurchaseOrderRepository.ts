import { PurchaseOrder } from "../entities/PurchaseOrder";

export interface IPurchaseOrderRepository {
  findById(id: string): Promise<PurchaseOrder | null>;
  findAll(): Promise<PurchaseOrder[]>;
  findBySupplierId(supplierId: string): Promise<PurchaseOrder[]>;
  save(order: PurchaseOrder): Promise<void>;
  update(order: PurchaseOrder): Promise<void>;
}
