export type Role = "admin" | "staff";

export interface StaffUser {
  id: string;
  name: string;
  pin: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  available: boolean;
}

export type SelectionType = "single" | "multi";

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selectionType: SelectionType;
  options: ModifierOption[];
  categoryIds: string[];
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  modifiers: SelectedModifier[];
  quantity: number;
  note?: string;
}

export type OrderType = "dine-in" | "tapau";
export type OrderStatus = "new" | "cooking" | "ready" | "served" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "qr";

export interface CancelledItem {
  name: string;
  quantity: number;
  basePrice: number;
  modifiers: SelectedModifier[];
  cancelledAt: number;
}

export interface Order {
  id: string;
  type: OrderType;
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  paymentMethod?: PaymentMethod;
  amountReceived?: number;
  offlineQueued?: boolean;
  offlineLate?: boolean;
  cancelledItems?: CancelledItem[];
}

export interface TableEntity {
  id: string;
  name: string;
}

export interface Settings {
  restaurantName: string;
  address: string;
  taxServiceEnabled: boolean;
  taxServicePercent: number;
}

export function lineTotal(item: OrderItem): number {
  const modTotal = item.modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
  return (item.basePrice + modTotal) * item.quantity;
}

export function orderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + lineTotal(item), 0);
}
