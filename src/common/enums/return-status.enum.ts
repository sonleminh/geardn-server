export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', // Admin duyệt hoàn hàng
  REJECTED = 'REJECTED', // Admin từ chối
  COMPLETED = 'COMPLETED', // Đã hoàn hàng thành công
  CANCELED = 'CANCELED', // Khách rút lại / hệ thống huỷ
}