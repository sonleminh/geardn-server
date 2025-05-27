import { AdjustmentType } from '@prisma/client';
import { ExportType } from '../enums/export-type.enum';
import { ImportType } from '../enums/import-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { AdjustmentReason } from '../enums/adjustment-type.enum';

export const ENUM_LABELS = {
  'order-status': [
    { value: OrderStatus.PENDING, label: 'Chờ xác nhận' },
    { value: OrderStatus.PROCESSING, label: 'Đang xử lý' },
    { value: OrderStatus.SHIPPED, label: 'Đang vận chuyển' },
    { value: OrderStatus.DELIVERED, label: 'Đã giao' },
    { value: OrderStatus.CANCELED, label: 'Đã huỷ' },
  ],
  'import-type': [
    { value: ImportType.NEW, label: 'Nhập hàng mới' },
    { value: ImportType.RETURN, label: 'Hoàn trả hàng' },
    { value: ImportType.ADJUSTMENT, label: 'Điều chỉnh tồn kho' },
    { value: ImportType.TRANSFER, label: 'Chuyển kho' },
    { value: ImportType.OTHER, label: 'Khác' },
  ],
  'export-type': [
    { value: ExportType.CUSTOMER_ORDER, label: 'Xuất cho đơn hàng khách' },
    { value: ExportType.RETURN_TO_SUPPLIER, label: 'Trả hàng về nhà cung cấp' },
    { value: ExportType.TRANSFER, label: 'Chuyển kho' },
    { value: ExportType.DAMAGE_LOSS, label: 'Hỏng, mất mát' },
    { value: ExportType.MANUAL, label: 'Ghi tay, điều chỉnh thủ công' },
  ],
  'adjustment-type': [
    { value: AdjustmentType.INCREASE, label: 'Tăng' },
    { value: AdjustmentType.DECREASE, label: 'Giảm' },
  ],
  'adjustment-reason': [
    { value: AdjustmentReason.INVENTORY_AUDIT, label: 'Kiểm kê tồn kho' },
    { value: AdjustmentReason.DAMAGED, label: 'Hỏng, mất mát' },
    { value: AdjustmentReason.LOST, label: 'Mất mát' },
    { value: AdjustmentReason.FOUND, label: 'Tìm thấy' },
    { value: AdjustmentReason.CUSTOMER_RETURN, label: 'Trả hàng' },
  ],
};
