import { StockMovement } from "../entities/StockMovement";

export interface StockHistoryFilter {
  productId?: string;
  from?: Date;
  to?: Date;
}

export interface IStockMovementRepository {
  findById(id: string): Promise<StockMovement | null>;
  findByFilter(filter: StockHistoryFilter): Promise<StockMovement[]>;
  save(movement: StockMovement): Promise<void>;
}
