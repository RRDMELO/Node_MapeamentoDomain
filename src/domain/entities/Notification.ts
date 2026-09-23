export type NotificationChannel = "EMAIL" | "SYSTEM";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface NotificationProps {
  id: string;
  productId: string;
  productName: string;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;
  createdAt: Date;
  sentAt?: Date;
}

export class Notification {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get productId() {
    return this.props.productId;
  }
  get productName() {
    return this.props.productName;
  }
  get channel() {
    return this.props.channel;
  }
  get message() {
    return this.props.message;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get sentAt() {
    return this.props.sentAt;
  }

  markAsSent(): void {
    this.props.status = "SENT";
    this.props.sentAt = new Date();
  }

  markAsFailed(): void {
    this.props.status = "FAILED";
  }

  toObject(): NotificationProps {
    return { ...this.props };
  }
}
