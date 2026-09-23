export type NotificationType =
  | "deployment.succeeded"
  | "deployment.failed"
  | "domain.verified"
  | "ssl.provisioned"
  | "payment.verified"
  | "payment.failed"
  | "wallet.low_balance"
  | "incident.opened"
  | "incident.resolved"
  | "admin.account_suspended";

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationService {
  send(payload: NotificationPayload): Promise<void>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
}
