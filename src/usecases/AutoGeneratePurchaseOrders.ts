import { randomUUID } from "crypto";
import { PurchaseOrder } from "../../domain/entities/PurchaseOrder";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { IPurchaseOrderRepository } from "../../domain/repositories/IPurchaseOrderRepository";
import { ISupplierRepository } from "../../domain/repositories/ISupplierRepository";
import { CreatePurchaseOrderUseCase } from "./CreatePurchaseOrder";

/**
 * Verifica todos os produtos com estoque baixo e cria ordens de compra automáticas
 * com base nas quantidades mínimas e no fornecedor vinculado ao produto.
 */
export class AutoGeneratePurchaseOrdersUseCase {
  constructor(
    private productRepository: IProductRepository,
    private supplierRepository: ISupplierRepository,
    private createPurchaseOrderUseCase: CreatePurchaseOrderUseCase,
  ) {}

  async execute(): Promise<PurchaseOrder[]> {
    const lowStockProducts = await this.productRepository.findLowStock();

    // Agrupa produtos por fornecedor
    const bySupplier = new Map<string, typeof lowStockProducts>();
    for (const product of lowStockProducts) {
      if (!product.supplierId) continue;
      const group = bySupplier.get(product.supplierId) ?? [];
      group.push(product);
      bySupplier.set(product.supplierId, group);
    }

    const orders: PurchaseOrder[] = [];

    for (const [supplierId, products] of bySupplier.entries()) {
      const supplier = await this.supplierRepository.findById(supplierId);
      if (!supplier) continue;

      const order = await this.createPurchaseOrderUseCase.execute({
        supplierId,
        items: products.map((p) => ({
          productId: p.id,
          // Pede o dobro do mínimo para repor com margem
          quantity: p.minimumStock * 2 - p.quantity,
          unitCost: p.costPrice,
        })),
      });
      orders.push(order);
    }

    return orders;
  }
}
