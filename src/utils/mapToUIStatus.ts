import { OrderStatus } from '@prisma/client';

// FE hoặc BE đều được
export type UIOrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED';

export function mapToUIStatus(s: OrderStatus): UIOrderStatus {
  return s === 'DELIVERY_FAILED' || s === 'CANCELED' ? 'CANCELED' : s;
}
