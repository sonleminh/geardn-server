export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export const typeToStatusMap: Record<string, OrderStatus> = {
  '1': OrderStatus.PENDING,
  '2': OrderStatus.PROCESSING,
  '3': OrderStatus.SHIPPED,
  '4': OrderStatus.DELIVERED,
  '5': OrderStatus.CANCELED,
};