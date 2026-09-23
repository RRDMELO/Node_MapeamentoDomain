import { Sale } from "../../domain/entities/Sale";
import {
  ISaleRepository,
  SalesHistoryFilter,
  SalesReport,
} from "../../domain/repositories/ISaleRepository";

export class InMemorySaleRepository implements ISaleRepository {
  private sales: Sale[] = [];

  async findById(id: string): Promise<Sale | null> {
    return this.sales.find((s) => s.id === id) ?? null;
  }

  async findByFilter(filter: SalesHistoryFilter): Promise<Sale[]> {
    return this.sales.filter((s) => {
      if (filter.from && s.soldAt < filter.from) return false;
      if (filter.to && s.soldAt > filter.to) return false;
      if (filter.productId) {
        const hasProduct = s.items.some(
          (i) => i.productId === filter.productId,
        );
        if (!hasProduct) return false;
      }
      return true;
    });
  }

  async getSalesReport(filter: SalesHistoryFilter): Promise<SalesReport[]> {
    const filtered = await this.findByFilter(filter);
    const reportMap = new Map<string, SalesReport>();

    for (const sale of filtered) {
      for (const item of sale.items) {
        if (filter.productId && item.productId !== filter.productId) continue;
        const existing = reportMap.get(item.productId);
        const revenue = item.unitPrice * item.quantity;
        const profit = (item.unitPrice - item.costPrice) * item.quantity;

        if (existing) {
          existing.totalQuantitySold += item.quantity;
          existing.totalRevenue += revenue;
          existing.totalProfit += profit;
        } else {
          reportMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            totalQuantitySold: item.quantity,
            totalRevenue: revenue,
            totalProfit: profit,
          });
        }
      }
    }

    return Array.from(reportMap.values()).sort(
      (a, b) => b.totalQuantitySold - a.totalQuantitySold,
    );
  }

  async save(sale: Sale): Promise<void> {
    this.sales.push(sale);
  }
}
