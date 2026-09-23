import { randomUUID } from "crypto";
import { RegisterProductUseCase } from "./usecases/RegisterProduct";
import { UpdateStockUseCase } from "./usecases/UpdateStock";
import { RecordSaleUseCase } from "./usecases/RecordSale";
import { GetSalesReportUseCase } from "./usecases/GetSalesReport";
import { GetStockHistoryUseCase } from "./usecases/GetStockHistory";
import { CreatePurchaseOrderUseCase } from "./usecases/CreatePurchaseOrder";
import { AutoGeneratePurchaseOrdersUseCase } from "./usecases/AutoGeneratePurchaseOrders";
import { UpdateDeliveryForecastUseCase } from "./usecases/UpdateDeliveryForecast";
import { SetMinimumStockUseCase } from "./usecases/SetMinimumStock";

import { InMemoryProductRepository } from "./infra/repositories/InMemoryProductRepository";
import { InMemoryStockMovementRepository } from "./infra/repositories/InMemoryStockMovementRepository";
import { InMemorySaleRepository } from "./infra/repositories/InMemorySaleRepository";
import { InMemoryPurchaseOrderRepository } from "./infra/repositories/InMemoryPurchaseOrderRepository";
import { InMemorySupplierRepository } from "./infra/repositories/InMemorySupplierRepository";
import { InMemoryNotificationRepository } from "./infra/repositories/InMemoryNotificationRepository";
import { ConsoleNotificationService } from "./infra/repositories/ConsoleNotificationService";
import { Supplier } from "./domain/entities/Supplier";

async function main() {
  console.log("=== Sistema de Gerenciamento de Estoque ===\n");

  // Infra
  const productRepo = new InMemoryProductRepository();
  const stockRepo = new InMemoryStockMovementRepository();
  const notifRepo = new InMemoryNotificationRepository();
  const saleRepo = new InMemorySaleRepository();
  const orderRepo = new InMemoryPurchaseOrderRepository();
  const supplierRepo = new InMemorySupplierRepository();
  const notifService = new ConsoleNotificationService();

  // Casos de uso
  const registerProduct = new RegisterProductUseCase(productRepo);
  const updateStock = new UpdateStockUseCase(
    productRepo,
    stockRepo,
    notifRepo,
    notifService,
  );
  const setMinimum = new SetMinimumStockUseCase(productRepo);
  const recordSale = new RecordSaleUseCase(productRepo, saleRepo, updateStock);
  const getSalesReport = new GetSalesReportUseCase(saleRepo);
  const getStockHistory = new GetStockHistoryUseCase(stockRepo);
  const createOrder = new CreatePurchaseOrderUseCase(productRepo, orderRepo);
  const autoOrders = new AutoGeneratePurchaseOrdersUseCase(
    productRepo,
    supplierRepo,
    createOrder,
  );
  const updateDelivery = new UpdateDeliveryForecastUseCase(orderRepo);

  // 1. Cadastrar fornecedor
  const supplier = new Supplier({
    id: randomUUID(),
    name: "TechSupply Ltda",
    email: "pedidos@techsupply.com",
    defaultDeliveryDays: 7,
    createdAt: new Date(),
  });
  await supplierRepo.save(supplier);
  console.log(`✅ Fornecedor cadastrado: ${supplier.name}`);

  // 2. Cadastrar produtos
  const teclado = await registerProduct.execute({
    name: "Teclado Mecânico",
    color: "Preto",
    price: 350,
    costPrice: 120,
    initialQuantity: 20,
    minimumStock: 5,
    supplierId: supplier.id,
  });
  const mouse = await registerProduct.execute({
    name: "Mouse Gamer",
    color: "RGB",
    price: 180,
    costPrice: 60,
    initialQuantity: 15,
    minimumStock: 3,
    supplierId: supplier.id,
  });
  console.log(`✅ Produto cadastrado: ${teclado.name} (ID: ${teclado.id})`);
  console.log(`✅ Produto cadastrado: ${mouse.name} (ID: ${mouse.id})`);

  // 3. Registrar vendas
  console.log("\n📦 Registrando vendas...");
  await recordSale.execute({
    items: [
      { productId: teclado.id, quantity: 10 },
      { productId: mouse.id, quantity: 8 },
    ],
  });
  await recordSale.execute({ items: [{ productId: teclado.id, quantity: 7 }] });

  // 4. Relatório de vendas
  const report = await getSalesReport.execute({});
  console.log("\n📊 Relatório de Vendas:");
  for (const r of report) {
    console.log(
      `  ${r.productName}: ${r.totalQuantitySold} unidades | Receita: R\$${r.totalRevenue.toFixed(2)} | Lucro: R\$${r.totalProfit.toFixed(2)}`,
    );
  }

  // 5. Histórico de estoque
  const history = await getStockHistory.execute({ productId: teclado.id });
  console.log(
    `\n📋 Histórico de movimentação do Teclado: ${history.length} registros`,
  );

  // 6. Verificar estoque baixo — teclado ficou com 3 (< mínimo 5) → alerta já foi disparado!
  const tecladoAtual = await productRepo.findById(teclado.id);
  console.log(
    `\n⚠️  Estoque atual do Teclado: ${tecladoAtual?.quantity} (mínimo: ${tecladoAtual?.minimumStock})`,
  );
  console.log(`   isLowStock: ${tecladoAtual?.isLowStock()}`);

  // 7. Gerar ordens de compra automáticas
  console.log("\n🛒 Gerando ordens de compra automáticas...");
  const orders = await autoOrders.execute();
  for (const o of orders) {
    console.log(
      `  Ordem criada para fornecedor ${o.supplierId}: ${o.items.length} item(s) | Total: R\$${o.totalCost.toFixed(2)}`,
    );
    // 8. Simular atualização de prazo pelo fornecedor
    const updated = await updateDelivery.execute({
      orderId: o.id,
      estimatedDeliveryAt: new Date("2026-10-05"),
    });
    console.log(
      `  → Prazo de entrega atualizado: ${updated.estimatedDeliveryAt?.toLocaleDateString("pt-BR")}`,
    );
  }

  console.log("\n✨ Demo concluída!");
}

main().catch(console.error);
