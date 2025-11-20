import {
  AdjustmentReason,
  AdjustmentType,
} from '../enums/adjustment-type.enum';
import { ExportType } from '../enums/export-type.enum';
import { ImportType } from '../enums/import-type.enum';
import { OrderReasonCode } from '../enums/order-reason-code';
import { OrderStatus } from '../enums/order-status.enum';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductTag } from '../enums/product-tag.enum';
import { ReturnStatus } from '../enums/return-status.enum';
import { ReturnType } from '../enums/return-type.enum';

export const ENUM_LABELS = {
  'order-status': [
    { value: OrderStatus.PENDING, label: 'Chờ xác nhận' },
    { value: OrderStatus.PROCESSING, label: 'Đang xử lý' },
    { value: OrderStatus.SHIPPED, label: 'Đang giao' },
    { value: OrderStatus.DELIVERED, label: 'Đã giao' },
    { value: OrderStatus.DELIVERY_FAILED, label: 'Giao thất bại' },
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
  'product-tag': [
    { value: ProductTag.NEW, label: 'Mới' },
    { value: ProductTag.SALE, label: 'Giảm giá' },
    { value: ProductTag.HOT, label: 'Hot' },
    { value: ProductTag.BESTSELLER, label: 'Bán chạy' },
    { value: ProductTag.COMING_SOON, label: 'Sắp có hàng' },
  ],
  'product-status': [
    { value: ProductStatus.DRAFT, label: 'Nháp' },
    { value: ProductStatus.ACTIVE, label: 'Hoạt động' },
    { value: ProductStatus.OUT_OF_STOCK, label: 'Hết hàng' },
    { value: ProductStatus.DISCONTINUED, label: 'Ngừng bán' },
  ],
  'order-reason-code': [
    { value: OrderReasonCode.CUSTOMER_CHANGED_MIND, label: 'Khách hàng đổi ý' },
    { value: OrderReasonCode.OUT_OF_STOCK, label: 'Hết hàng' },
    { value: OrderReasonCode.DUPLICATE_ORDER, label: 'Trùng đơn' },
    { value: OrderReasonCode.PAYMENT_FAILED, label: 'Thanh toán lỗi' },
    { value: OrderReasonCode.REFUSED_ON_DELIVERY, label: 'Từ chối nhận hàng' },
    { value: OrderReasonCode.DEFECTIVE, label: 'Hàng lỗi' },
    { value: OrderReasonCode.WRONG_ITEM, label: 'Giao sai sản phẩm' },
    {
      value: OrderReasonCode.BETTER_PRICE_FOUND,
      label: 'Tìm được chỗ khác rẻ hơn',
    },
    { value: OrderReasonCode.OTHER, label: 'Khác' },
  ],
  'return-type': [
    { value: ReturnType.CANCEL, label: 'Đơn huỷ' },
    { value: ReturnType.RETURN, label: 'Đơn hoàn' },
    { value: ReturnType.DELIVERY_FAIL, label: 'Giao thất bại' },
  ],
  'return-status': [
    { value: ReturnStatus.AWAITING_APPROVAL, label: 'Chờ duyệt' },
    { value: ReturnStatus.APPROVED, label: 'Đã duyệt' },
    { value: ReturnStatus.REJECTED, label: 'Từ chối' },
    { value: ReturnStatus.COMPLETED, label: 'Hoàn thành' },
    { value: ReturnStatus.CANCELED, label: 'Đã huỷ' },
  ],
};
