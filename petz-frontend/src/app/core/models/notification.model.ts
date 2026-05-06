export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  refId?: number;
  refType?: string;
  createdAt?: string;
}
