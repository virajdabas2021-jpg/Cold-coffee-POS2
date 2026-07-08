export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  ingredients: {
    inventoryId: string;
    amount: number; // amount used per order, e.g. 0.2 Liters of milk
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  lastUpdated: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  paymentStatus: 'Paid' | 'Pending';
  staffId: string;
  staffName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minOrderValue: number;
  active: boolean;
}

export interface Staff {
  id: string;
  name: string;
  pin: string;
  role: 'Admin' | 'Cashier';
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface DBStructure {
  menu: MenuItem[];
  inventory: InventoryItem[];
  orders: Order[];
  coupons: Coupon[];
  staff: Staff[];
  customers: Customer[];
}
