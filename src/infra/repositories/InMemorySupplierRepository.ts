import { Supplier } from "../../domain/entities/Supplier";
import { ISupplierRepository } from "../../domain/repositories/ISupplierRepository";

export class InMemorySupplierRepository implements ISupplierRepository {
  private suppliers: Map<string, Supplier> = new Map();

  async findById(id: string): Promise<Supplier | null> {
    return this.suppliers.get(id) ?? null;
  }

  async findAll(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async save(supplier: Supplier): Promise<void> {
    this.suppliers.set(supplier.id, supplier);
  }

  async update(supplier: Supplier): Promise<void> {
    if (!this.suppliers.has(supplier.id)) throw new Error("Supplier not found");
    this.suppliers.set(supplier.id, supplier);
  }

  async delete(id: string): Promise<void> {
    this.suppliers.delete(id);
  }
}
