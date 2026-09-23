export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface SaleProps {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  soldAt: Date;
}

export class Sale {
  private props: SaleProps;

  constructor(
    props: Omit<SaleProps, "totalAmount" | "totalProfit"> & Partial<SaleProps>,
  ) {
    const totalAmount =
      props.totalAmount ??
      props.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const totalProfit =
      props.totalProfit ??
      props.items.reduce(
        (sum, i) => sum + (i.unitPrice - i.costPrice) * i.quantity,
        0,
      );
    this.props = { ...props, totalAmount, totalProfit };
  }

  get id() {
    return this.props.id;
  }
  get items() {
    return this.props.items;
  }
  get totalAmount() {
    return this.props.totalAmount;
  }
  get totalProfit() {
    return this.props.totalProfit;
  }
  get soldAt() {
    return this.props.soldAt;
  }

  toObject(): SaleProps {
    return { ...this.props, items: [...this.props.items] };
  }
}
