import { IStockMovementRepository } from "../../domain/repositories/IStockMovementRepository";
import { StockMovement } from "../../domain/entities/StockMovement";

export interface GetStockHistoryInput {
  productId?: string;
  from?: Date;
  to?: Date;
}

export class GetStockHistoryUseCase {
  constructor(private stockMovementRepository: IStockMovementRepository) {}

  async execute(input: GetStockHistoryInput): Promise<StockMovement[]> {
    return this.stockMovementRepository.findByFilter({
      productId: input.productId,
      from: input.from,
      to: input.to,
    });
  }
}
