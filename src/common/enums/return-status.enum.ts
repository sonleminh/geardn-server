export enum ReturnStatus {
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED', // Admin duyệt hoàn hàng
  REJECTED = 'REJECTED', // Admin từ chối
  COMPLETED = 'COMPLETED', // Đã hoàn hàng thành công
  CANCELED = 'CANCELED', // Khách rút lại / hệ thống huỷ
}