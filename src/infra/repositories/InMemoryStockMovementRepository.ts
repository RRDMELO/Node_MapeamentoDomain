import { StockMovement } from "../../domain/entities/StockMovement";
import {
  IStockMovementRepository,
  StockHistoryFilter,
} from "../../domain/repositories/IStockMovementRepository";

export class InMemoryStockMovementRepository implements IStockMovementRepository {
  private movements: StockMovement[] = [];

  async findById(id: string): Promise<StockMovement | null> {
    return this.movements.find((m) => m.id === id) ?? null;
  }

  async findByFilter(filter: StockHistoryFilter): Promise<StockMovement[]> {
    return this.movements.filter((m) => {
      if (filter.productId && m.productId !== filter.productId) return false;
      if (filter.from && m.createdAt < filter.from) return false;
      if (filter.to && m.createdAt > filter.to) return false;
      return true;
    });
  }

  async save(movement: StockMovement): Promise<void> {
    this.movements.push(movement);
  }
}
