export enum OrderStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

export const typeToStatusMap: Record<string, OrderStatusEnum> = {
  '1': OrderStatusEnum.PENDING,
  '2': OrderStatusEnum.PROCESSING,
  '3': OrderStatusEnum.SHIPPED,
  '4': OrderStatusEnum.DELIVERED,
  '5': OrderStatusEnum.CANCELED,
};