export type PurchaseOrderStatus =
  | "PENDING"
  | "SENT"
  | "CONFIRMED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderProps {
  id: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  totalCost: number;
  /** Prazo de entrega estimado informado pelo fornecedor */
  estimatedDeliveryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseOrder {
  private props: PurchaseOrderProps;

  constructor(
    props: Omit<PurchaseOrderProps, "totalCost"> &
      Partial<Pick<PurchaseOrderProps, "totalCost">>,
  ) {
    const totalCost =
      props.totalCost ??
      props.items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);
    this.props = { ...props, totalCost };
  }

  get id() {
    return this.props.id;
  }
  get supplierId() {
    return this.props.supplierId;
  }
  get items() {
    return this.props.items;
  }
  get status() {
    return this.props.status;
  }
  get totalCost() {
    return this.props.totalCost;
  }
  get estimatedDeliveryAt() {
    return this.props.estimatedDeliveryAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  updateStatus(newStatus: PurchaseOrderStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  updateEstimatedDelivery(date: Date): void {
    this.props.estimatedDeliveryAt = date;
    this.props.updatedAt = new Date();
  }

  toObject(): PurchaseOrderProps {
    return { ...this.props, items: [...this.props.items] };
  }
}
