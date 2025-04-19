import { ImportType } from '../enums/import-type.enum';
import { OrderStatus } from '../enums/order-status.enum';

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
    { value: ImportType.ADJUST, label: 'Điều chỉnh tồn kho' },
  ],
};
