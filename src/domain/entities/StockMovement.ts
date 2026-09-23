export type MovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockMovementProps {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  /** Referência a um pedido de venda ou ordem de compra */
  referenceId?: string;
  createdAt: Date;
}

export class StockMovement {
  private props: StockMovementProps;

  constructor(props: StockMovementProps) {
    if (props.quantity <= 0) {
      throw new Error("Movement quantity must be greater than zero");
    }
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get productId() {
    return this.props.productId;
  }
  get type() {
    return this.props.type;
  }
  get quantity() {
    return this.props.quantity;
  }
  get reason() {
    return this.props.reason;
  }
  get referenceId() {
    return this.props.referenceId;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  toObject(): StockMovementProps {
    return { ...this.props };
  }
}
