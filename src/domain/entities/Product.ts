export interface ProductProps {
  id: string;
  name: string;
  description?: string;
  size?: string;
  color?: string;
  price: number;
  costPrice: number;
  quantity: number;
  minimumStock: number;
  supplierId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get size() {
    return this.props.size;
  }
  get color() {
    return this.props.color;
  }
  get price() {
    return this.props.price;
  }
  get costPrice() {
    return this.props.costPrice;
  }
  get quantity() {
    return this.props.quantity;
  }
  get minimumStock() {
    return this.props.minimumStock;
  }
  get supplierId() {
    return this.props.supplierId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  /** Verifica se o estoque está abaixo ou igual ao mínimo definido */
  isLowStock(): boolean {
    return this.props.quantity <= this.props.minimumStock;
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity < 0) throw new Error("Quantity cannot be negative");
    this.props.quantity = newQuantity;
    this.props.updatedAt = new Date();
  }

  updateMinimumStock(minimum: number): void {
    if (minimum < 0) throw new Error("Minimum stock cannot be negative");
    this.props.minimumStock = minimum;
    this.props.updatedAt = new Date();
  }

  toObject(): ProductProps {
    return { ...this.props };
  }
}
