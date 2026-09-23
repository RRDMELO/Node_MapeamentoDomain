import { randomUUID } from "crypto";
import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";

export interface RegisterProductInput {
  name: string;
  description?: string;
  size?: string;
  color?: string;
  price: number;
  costPrice: number;
  initialQuantity: number;
  minimumStock: number;
  supplierId?: string;
}

export class RegisterProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: RegisterProductInput): Promise<Product> {
    const now = new Date();
    const product = new Product({
      id: randomUUID(),
      name: input.name,
      description: input.description,
      size: input.size,
      color: input.color,
      price: input.price,
      costPrice: input.costPrice,
      quantity: input.initialQuantity,
      minimumStock: input.minimumStock,
      supplierId: input.supplierId,
      createdAt: now,
      updatedAt: now,
    });

    await this.productRepository.save(product);
    return product;
  }
}
