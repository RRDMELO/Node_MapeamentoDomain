export interface SupplierProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  /** Prazo de entrega padrão em dias */
  defaultDeliveryDays?: number;
  createdAt: Date;
}

export class Supplier {
  private props: SupplierProps;

  constructor(props: SupplierProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }
  get defaultDeliveryDays() {
    return this.props.defaultDeliveryDays;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  toObject(): SupplierProps {
    return { ...this.props };
  }
}
