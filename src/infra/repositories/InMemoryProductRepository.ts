import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findLowStock(): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.isLowStock());
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async update(product: Product): Promise<void> {
    if (!this.products.has(product.id)) throw new Error("Product not found");
    this.products.set(product.id, product);
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }
}
