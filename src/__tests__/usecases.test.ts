import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProductRepository } from "../infra/repositories/InMemoryProductRepository";
import { InMemoryStockMovementRepository } from "../infra/repositories/InMemoryStockMovementRepository";
import { InMemoryNotificationRepository } from "../infra/repositories/InMemoryNotificationRepository";
import { InMemorySaleRepository } from "../infra/repositories/InMemorySaleRepository";
import { InMemoryPurchaseOrderRepository } from "../infra/repositories/InMemoryPurchaseOrderRepository";
import { InMemorySupplierRepository } from "../infra/repositories/InMemorySupplierRepository";
import { ConsoleNotificationService } from "../infra/repositories/ConsoleNotificationService";

import { RegisterProductUseCase } from "../usecases/RegisterProduct";
import { UpdateStockUseCase } from "../usecases/UpdateStock";
import { SetMinimumStockUseCase } from "../usecases/SetMinimumStock";
import { RecordSaleUseCase } from "../usecases/RecordSale";
import { GetSalesReportUseCase } from "../usecases/GetSalesReport";
import { GetStockHistoryUseCase } from "../usecases/GetStockHistory";
import { CreatePurchaseOrderUseCase } from "../usecases/CreatePurchaseOrder";
import { AutoGeneratePurchaseOrdersUseCase } from "../usecases/AutoGeneratePurchaseOrders";
import { UpdateDeliveryForecastUseCase } from "../usecases/UpdateDeliveryForecast";
import { Supplier } from "../domain/entities/Supplier";

// ─── Setup helpers ───────────────────────────────────────────────────────────

function buildDeps() {
  const productRepo = new InMemoryProductRepository();
  const stockRepo = new InMemoryStockMovementRepository();
  const notifRepo = new InMemoryNotificationRepository();
  const saleRepo = new InMemorySaleRepository();
  const orderRepo = new InMemoryPurchaseOrderRepository();
  const supplierRepo = new InMemorySupplierRepository();
  const notifService = new ConsoleNotificationService();

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

  return {
    productRepo,
    stockRepo,
    notifRepo,
    saleRepo,
    orderRepo,
    supplierRepo,
    registerProduct,
    updateStock,
    setMinimum,
    recordSale,
    getSalesReport,
    getStockHistory,
    createOrder,
    autoOrders,
    updateDelivery,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("RegisterProduct", () => {
  it("deve cadastrar um produto com atributos extras", async () => {
    const { registerProduct } = buildDeps();
    const product = await registerProduct.execute({
      name: "Camiseta Azul P",
      size: "P",
      color: "Azul",
      price: 59.9,
      costPrice: 20,
      initialQuantity: 50,
      minimumStock: 10,
    });

    expect(product.id).toBeDefined();
    expect(product.name).toBe("Camiseta Azul P");
    expect(product.size).toBe("P");
    expect(product.color).toBe("Azul");
    expect(product.quantity).toBe(50);
    expect(product.isLowStock()).toBe(false);
  });
});

describe("UpdateStock & alertas", () => {
  it("deve reduzir o estoque e disparar alerta quando abaixo do mínimo", async () => {
    const { registerProduct, updateStock, notifRepo } = buildDeps();

    const product = await registerProduct.execute({
      name: "Caneta",
      price: 5,
      costPrice: 1,
      initialQuantity: 12,
      minimumStock: 10,
    });

    // Saída que leva o estoque para 10 (exatamente no mínimo → alerta)
    await updateStock.execute({
      productId: product.id,
      type: "OUT",
      quantity: 2,
    });

    const notifications = await notifRepo.findByProductId(product.id);
    expect(notifications.length).toBe(2); // EMAIL + SYSTEM
    expect(notifications[0].channel).toBe("EMAIL");
    expect(notifications[1].channel).toBe("SYSTEM");
  });

  it("deve lançar erro se quantidade insuficiente", async () => {
    const { registerProduct, updateStock } = buildDeps();
    const product = await registerProduct.execute({
      name: "Borracha",
      price: 2,
      costPrice: 0.5,
      initialQuantity: 5,
      minimumStock: 1,
    });

    await expect(
      updateStock.execute({ productId: product.id, type: "OUT", quantity: 10 }),
    ).rejects.toThrow("Insufficient stock");
  });
});

describe("SetMinimumStock", () => {
  it("deve atualizar o estoque mínimo de um produto", async () => {
    const { registerProduct, setMinimum } = buildDeps();
    const product = await registerProduct.execute({
      name: "Notebook",
      price: 3000,
      costPrice: 2000,
      initialQuantity: 5,
      minimumStock: 1,
    });

    const updated = await setMinimum.execute(product.id, 3);
    expect(updated.minimumStock).toBe(3);
  });
});

describe("RecordSale & relatório", () => {
  it("deve registrar venda e calcular lucro corretamente", async () => {
    const { registerProduct, recordSale, getSalesReport } = buildDeps();

    const p1 = await registerProduct.execute({
      name: "Fone BT",
      price: 200,
      costPrice: 80,
      initialQuantity: 20,
      minimumStock: 2,
    });
    const p2 = await registerProduct.execute({
      name: "Cabo USB",
      price: 30,
      costPrice: 10,
      initialQuantity: 50,
      minimumStock: 5,
    });

    await recordSale.execute({
      items: [
        { productId: p1.id, quantity: 3 },
        { productId: p2.id, quantity: 5 },
      ],
    });

    const report = await getSalesReport.execute({});
    expect(report).toHaveLength(2);

    const fone = report.find((r) => r.productName === "Fone BT")!;
    expect(fone.totalQuantitySold).toBe(3);
    expect(fone.totalRevenue).toBeCloseTo(600);
    expect(fone.totalProfit).toBeCloseTo(360); // (200-80)*3
  });
});

describe("GetStockHistory", () => {
  it("deve retornar histórico de movimentações por produto", async () => {
    const { registerProduct, updateStock, getStockHistory } = buildDeps();
    const product = await registerProduct.execute({
      name: "Mesa",
      price: 800,
      costPrice: 400,
      initialQuantity: 10,
      minimumStock: 1,
    });

    await updateStock.execute({
      productId: product.id,
      type: "IN",
      quantity: 5,
    });
    await updateStock.execute({
      productId: product.id,
      type: "OUT",
      quantity: 2,
    });

    const history = await getStockHistory.execute({ productId: product.id });
    expect(history).toHaveLength(2);
    expect(history[0].type).toBe("IN");
    expect(history[1].type).toBe("OUT");
  });
});

describe("CreatePurchaseOrder", () => {
  it("deve criar uma ordem de compra manualmente", async () => {
    const { registerProduct, createOrder } = buildDeps();
    const product = await registerProduct.execute({
      name: "Cadeira",
      price: 500,
      costPrice: 250,
      initialQuantity: 3,
      minimumStock: 2,
    });

    const order = await createOrder.execute({
      supplierId: "supplier-abc",
      items: [{ productId: product.id, quantity: 10, unitCost: 250 }],
    });

    expect(order.status).toBe("PENDING");
    expect(order.totalCost).toBe(2500);
    expect(order.items[0].productName).toBe("Cadeira");
  });
});

describe("AutoGeneratePurchaseOrders", () => {
  it("deve gerar ordens automáticas para produtos com estoque baixo", async () => {
    const { registerProduct, supplierRepo, autoOrders, productRepo } =
      buildDeps();

    const supplier = new Supplier({
      id: "sup-1",
      name: "Fornecedor A",
      email: "fornecedor@a.com",
      createdAt: new Date(),
    });
    await supplierRepo.save(supplier);

    const product = await registerProduct.execute({
      name: "Teclado",
      price: 150,
      costPrice: 60,
      initialQuantity: 5,
      minimumStock: 5,
      supplierId: "sup-1",
    });

    // Estoque = 5 = mínimo → isLowStock = true
    const orders = await autoOrders.execute();
    expect(orders).toHaveLength(1);
    expect(orders[0].supplierId).toBe("sup-1");
  });
});

describe("UpdateDeliveryForecast", () => {
  it("deve atualizar o prazo de entrega da ordem", async () => {
    const { registerProduct, createOrder, updateDelivery } = buildDeps();
    const product = await registerProduct.execute({
      name: "Monitor",
      price: 1200,
      costPrice: 700,
      initialQuantity: 2,
      minimumStock: 1,
    });

    const order = await createOrder.execute({
      supplierId: "sup-x",
      items: [{ productId: product.id, quantity: 5, unitCost: 700 }],
    });

    const deliveryDate = new Date("2026-10-10");
    const updated = await updateDelivery.execute({
      orderId: order.id,
      estimatedDeliveryAt: deliveryDate,
    });
    expect(updated.estimatedDeliveryAt).toEqual(deliveryDate);
  });
});
