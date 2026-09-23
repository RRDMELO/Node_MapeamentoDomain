import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

export class SetMinimumStockUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string, minimumStock: number): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    product.updateMinimumStock(minimumStock);
    await this.productRepository.update(product);

    return product;
  }
}
