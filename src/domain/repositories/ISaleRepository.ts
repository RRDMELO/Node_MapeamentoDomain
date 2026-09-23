import { Sale } from "../entities/Sale";

export interface SalesHistoryFilter {
  productId?: string;
  from?: Date;
  to?: Date;
}

export interface SalesReport {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findByFilter(filter: SalesHistoryFilter): Promise<Sale[]>;
  getSalesReport(filter: SalesHistoryFilter): Promise<SalesReport[]>;
  save(sale: Sale): Promise<void>;
}
