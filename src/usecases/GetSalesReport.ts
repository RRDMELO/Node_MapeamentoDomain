import {
  ISaleRepository,
  SalesReport,
} from "../../domain/repositories/ISaleRepository";

export interface GetSalesReportInput {
  productId?: string;
  from?: Date;
  to?: Date;
}

export class GetSalesReportUseCase {
  constructor(private saleRepository: ISaleRepository) {}

  async execute(input: GetSalesReportInput): Promise<SalesReport[]> {
    return this.saleRepository.getSalesReport({
      productId: input.productId,
      from: input.from,
      to: input.to,
    });
  }
}
