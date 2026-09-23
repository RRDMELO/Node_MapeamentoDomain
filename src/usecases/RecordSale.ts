import { randomUUID } from "crypto";
import { Sale, SaleItem } from "../../domain/entities/Sale";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { UpdateStockUseCase } from "./UpdateStock";

export interface RecordSaleInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export class RecordSaleUseCase {
  constructor(
    private productRepository: IProductRepository,
    private saleRepository: ISaleRepository,
    private updateStockUseCase: UpdateStockUseCase,
  ) {}

  async execute(input: RecordSaleInput): Promise<Sale> {
    const saleItems: SaleItem[] = [];

    // Valida disponibilidade e monta itens da venda
    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product "${product.name}"`);
      }
      saleItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        costPrice: product.costPrice,
      });
    }

    const sale = new Sale({
      id: randomUUID(),
      items: saleItems,
      soldAt: new Date(),
    });

    await this.saleRepository.save(sale);

    // Desconta estoque de cada item (e verifica alertas internamente)
    for (const item of input.items) {
      await this.updateStockUseCase.execute({
        productId: item.productId,
        type: "OUT",
        quantity: item.quantity,
        referenceId: sale.id,
        reason: "Sale",
      });
    }

    return sale;
  }
}
