import { createClient } from "@supabase/supabase-js";
import { MenuItem, InventoryItem, Order, Coupon, Staff, Customer, DBStructure } from "../types";

// Supabase setup
const SUPABASE_URL =
  ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_URL) ||
  "https://luoggwvjvxbvprqhvehu.supabase.co";

const SUPABASE_KEY =
  ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_KEY) ||
  "sb_publishable_J9r0WjoYOURphP-e0cmvIg_77hcwMox";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fallback initial database structured exactly like data/db.json
const initialDB: DBStructure = {
  menu: [
    {
      id: "m_61ypardum",
      name: "oreo shake",
      price: 200,
      category: "Classic Brews",
      description: "",
      available: true,
      ingredients: []
    },
    {
      id: "m_moj890wks",
      name: "milk shake",
      price: 150,
      category: "Classic Brews",
      description: "",
      available: true,
      ingredients: []
    },
    {
      id: "m_jpnv302m9",
      name: "sandwitch",
      price: 250,
      category: "Classic Brews",
      description: "",
      available: true,
      ingredients: []
    },
    {
      id: "m_1ogozn8xw",
      name: "hjvhgvhgkyu",
      price: 800,
      category: "Classic Brews",
      description: "",
      available: true,
      ingredients: []
    }
  ],
  inventory: [
    {
      id: "i_v7y2dk918",
      name: "coco powder",
      currentStock: 20,
      unit: "kg",
      reorderLevel: 1,
      lastUpdated: "2026-07-07T14:55:33.786Z"
    },
    {
      id: "i_bwux28xr9",
      name: "sugar",
      currentStock: 10,
      unit: "kg",
      reorderLevel: 5,
      lastUpdated: "2026-07-07T15:19:12.395Z"
    }
  ],
  orders: [
    {
      id: "o_mc0yvmdtk",
      orderNumber: 1,
      items: [],
      subtotal: 150,
      discountAmount: 0,
      total: 150,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "Aman Manager",
      customerName: "Viraj Dabas",
      customerPhone: "5555555555",
      createdAt: "2026-07-07T16:03:27.289+00:00"
    },
    {
      id: "o_owkn28ktt",
      orderNumber: 2,
      items: [
        {
          menuItemId: "m_moj890wks",
          name: "milk shake",
          price: 150,
          quantity: 1,
          category: "Classic Brews"
        }
      ],
      subtotal: 150,
      discountAmount: 0,
      total: 150,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "byy",
      customerPhone: "0000000000",
      createdAt: "2026-07-08T06:29:57.578+00:00"
    },
    {
      id: "o_2nu9fjt5z",
      orderNumber: 3,
      items: [
        {
          menuItemId: "m_moj890wks",
          name: "milk shake",
          price: 150,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 300,
      discountAmount: 0,
      total: 300,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "iamviraj",
      customerPhone: "7894561230",
      createdAt: "2026-07-08T09:13:30.329+00:00"
    },
    {
      id: "o_wljygc98q",
      orderNumber: 2,
      items: [
        {
          menuItemId: "m_jpnv302m9",
          name: "sandwitch",
          price: 250,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 500,
      discountAmount: 0,
      total: 500,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "jaat",
      customerPhone: "7017429031",
      createdAt: "2026-07-08T06:26:26.316+00:00"
    },
    {
      id: "o_ddyzkgsws",
      orderNumber: 3,
      items: [
        {
          menuItemId: "m_jpnv302m9",
          name: "sandwitch",
          price: 250,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 500,
      discountAmount: 0,
      total: 500,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "Viraj Dabas",
      customerPhone: "5555555555",
      createdAt: "2026-07-08T06:26:45.991+00:00"
    },
    {
      id: "o_tutozxcio",
      orderNumber: 4,
      items: [
        {
          menuItemId: "m_jpnv302m9",
          name: "sandwitch",
          price: 250,
          quantity: 1,
          category: "Classic Brews"
        }
      ],
      subtotal: 250,
      discountAmount: 0,
      total: 250,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "hiii",
      customerPhone: "7894561230",
      createdAt: "2026-07-08T06:32:07.917+00:00"
    },
    {
      id: "o_vlfl4f6cs",
      orderNumber: 5,
      items: [
        {
          menuItemId: "m_jpnv302m9",
          name: "sandwitch",
          price: 250,
          quantity: 1,
          category: "Classic Brews"
        }
      ],
      subtotal: 250,
      discountAmount: 0,
      total: 250,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "hello",
      customerPhone: "7418529630",
      createdAt: "2026-07-08T06:32:44.19+00:00"
    },
    {
      id: "o_d262yaxvp",
      orderNumber: 6,
      items: [
        {
          menuItemId: "m_61ypardum",
          name: "oreo shake",
          price: 200,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 400,
      discountAmount: 0,
      total: 400,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "heyy",
      customerPhone: "7852396541",
      createdAt: "2026-07-08T06:42:37.61+00:00"
    },
    {
      id: "o_3kuroxi08",
      orderNumber: 7,
      items: [
        {
          menuItemId: "m_jpnv302m9",
          name: "sandwitch",
          price: 250,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 500,
      discountAmount: 0,
      total: 500,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "asdfghjkl",
      customerPhone: "7896321450",
      createdAt: "2026-07-08T06:45:49.345+00:00"
    },
    {
      id: "o_eyh3e4jfd",
      orderNumber: 8,
      items: [
        {
          menuItemId: "m_moj890wks",
          name: "milk shake",
          price: 150,
          quantity: 2,
          category: "Classic Brews"
        },
        {
          menuItemId: "m_61ypardum",
          name: "oreo shake",
          price: 200,
          quantity: 1,
          category: "Classic Brews"
        }
      ],
      subtotal: 500,
      discountAmount: 0,
      total: 500,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "shit",
      customerPhone: "7891234560",
      createdAt: "2026-07-08T06:49:50.743+00:00"
    },
    {
      id: "o_lnn0ikzkw",
      orderNumber: 9,
      items: [
        {
          menuItemId: "m_moj890wks",
          name: "milk shake",
          price: 150,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 300,
      discountAmount: 0,
      total: 300,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "staff_1",
      staffName: "akki",
      customerName: "jaattt",
      customerPhone: "5454487956",
      createdAt: "2026-07-08T06:54:44.366+00:00"
    },
    {
      id: "o_t2ddchiun",
      orderNumber: 10,
      items: [
        {
          menuItemId: "m_moj890wks",
          name: "milk shake",
          price: 150,
          quantity: 2,
          category: "Classic Brews"
        }
      ],
      subtotal: 300,
      discountAmount: 0,
      total: 300,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      staffId: "s_aum78dr66",
      staffName: "akki",
      customerId: "c_796cr32qs",
      customerName: "Viraj Dabas",
      customerPhone: "5555555555",
      createdAt: "2026-07-08T09:19:14.575Z"
    }
  ],
  coupons: [],
  staff: [
    {
      id: "s1",
      name: "Aman Manager",
      pin: "7890",
      role: "Admin",
      active: false
    },
    {
      id: "s_0vxhsjxom",
      name: "aniket kansal",
      pin: "0000",
      role: "Cashier",
      active: true
    },
    {
      id: "s_aum78dr66",
      name: "akki",
      pin: "2222",
      role: "Admin",
      active: true
    }
  ],
  customers: [
    {
      id: "c_xurjzm89c",
      name: "jaat",
      phone: "7017429031",
      email: "",
      totalOrders: 1,
      totalSpent: 500,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_796cr32qs",
      name: "Viraj Dabas",
      phone: "5555555555",
      email: "",
      totalOrders: 2,
      totalSpent: 450,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_olnbaxasf",
      name: "byy",
      phone: "0000000000",
      email: "",
      totalOrders: 1,
      totalSpent: 150,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_aqxr2erqv",
      name: "hiii",
      phone: "7894561230",
      email: "",
      totalOrders: 1,
      totalSpent: 250,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_p5z5boxb1",
      name: "hello",
      phone: "7418529630",
      email: "",
      totalOrders: 1,
      totalSpent: 250,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_5tj3pgcrt",
      name: "heyy",
      phone: "7852396541",
      email: "",
      totalOrders: 1,
      totalSpent: 400,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_hlghpd1m7",
      name: "asdfghjkl",
      phone: "7896321450",
      email: "",
      totalOrders: 1,
      totalSpent: 500,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_x23he81g7",
      name: "shit",
      phone: "7891234560",
      email: "",
      totalOrders: 1,
      totalSpent: 500,
      createdAt: "2026-07-08T09:18:27.614Z"
    },
    {
      id: "c_c7miatw3m",
      name: "jaattt",
      phone: "5454487956",
      email: "",
      totalOrders: 1,
      totalSpent: 300,
      createdAt: "2026-07-08T09:18:27.614Z"
    }
  ]
};

// Mappers between local structures and Supabase table schemas
function mapMenuToSupabase(item: MenuItem) {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category: item.category,
    description: item.description || null,
    available: item.available !== false,
    ingredients: item.ingredients || []
  };
}

function mapMenuFromSupabase(item: any): MenuItem {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price || 0),
    category: item.category || "Classic Brews",
    description: item.description || "",
    available: item.available !== false,
    ingredients: item.ingredients || []
  };
}

function mapInventoryToSupabase(item: InventoryItem) {
  return {
    id: item.id,
    name: item.name,
    currentStock: Number(item.currentStock),
    unit: item.unit,
    reorderLevel: Number(item.reorderLevel),
    lastUpdated: item.lastUpdated
  };
}

function mapInventoryFromSupabase(item: any): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    currentStock: Number(item.currentStock || 0),
    unit: item.unit || "Liters",
    reorderLevel: Number(item.reorderLevel || 0),
    lastUpdated: item.lastUpdated || new Date().toISOString()
  };
}

function packPunchedBy(staffName: string, orderNumber: number, items: any[]): string {
  const payload = {
    staffName,
    orderNumber,
    items
  };
  return JSON.stringify(payload);
}

function unpackPunchedBy(punchedBy: string | null) {
  const defaultVal = {
    staffName: punchedBy || "Cashier",
    orderNumber: 1,
    items: [] as any[]
  };
  if (!punchedBy) return defaultVal;
  try {
    if (punchedBy.trim().startsWith("{") && punchedBy.trim().endsWith("}")) {
      const parsed = JSON.parse(punchedBy);
      if (parsed && typeof parsed === "object") {
        return {
          staffName: parsed.staffName || "Cashier",
          orderNumber: Number(parsed.orderNumber) || 1,
          items: Array.isArray(parsed.items) ? parsed.items : []
        };
      }
    }
  } catch (e) {
    // Plain text staff name
  }
  return defaultVal;
}

function mapOrderToSupabase(item: Order) {
  return {
    id: item.id,
    customer_name: item.customerName || null,
    customer_phone: item.customerPhone || null,
    subtotal: Number(item.subtotal || 0),
    discount: Number(item.discountAmount || 0),
    total: Number(item.total || 0),
    payment_method: item.paymentMethod || "Cash",
    date: item.createdAt || new Date().toISOString(),
    punched_by: packPunchedBy(item.staffName || "Cashier", item.orderNumber || 1000, item.items || [])
  };
}

function mapOrderFromSupabase(item: any): Order {
  const unpacked = unpackPunchedBy(item.punched_by);
  return {
    id: item.id,
    orderNumber: unpacked.orderNumber,
    items: unpacked.items,
    subtotal: Number(item.subtotal || 0),
    discountAmount: Number(item.discount || 0),
    total: Number(item.total || 0),
    paymentMethod: (item.payment_method || "Cash") as "Cash" | "UPI" | "Card",
    paymentStatus: "Paid" as "Paid" | "Pending",
    staffId: "staff_1",
    staffName: unpacked.staffName,
    customerName: item.customer_name || undefined,
    customerPhone: item.customer_phone || undefined,
    createdAt: item.date || new Date().toISOString()
  };
}

function mapCouponToSupabase(item: Coupon) {
  return {
    code: item.code,
    discount_percent: Number(item.value || 0),
    min_cart_amount: Number(item.minOrderValue || 0),
    active: item.active !== false
  };
}

function mapCouponFromSupabase(item: any): Coupon {
  return {
    id: item.code,
    code: item.code,
    type: "Percentage" as "Percentage" | "Fixed",
    value: Number(item.discount_percent || 0),
    minOrderValue: Number(item.min_cart_amount || 0),
    active: item.active !== false
  };
}

function mapStaffToSupabase(item: Staff) {
  return {
    id: item.id,
    name: item.name,
    pin: item.pin,
    role: item.role,
    active: item.active !== false
  };
}

function mapStaffFromSupabase(item: any): Staff {
  return {
    id: item.id,
    name: item.name,
    pin: item.pin,
    role: (item.role || "Cashier") as "Admin" | "Cashier",
    active: item.active !== false
  };
}

function mapCustomerToSupabase(item: Customer) {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    visit_count: Number(item.totalOrders || 0),
    total_spent: Number(item.totalSpent || 0),
    favorite_drink: "Coffee",
    points: Math.floor(Number(item.totalSpent || 0) / 10)
  };
}

function mapCustomerFromSupabase(item: any): Customer {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: "",
    totalOrders: Number(item.visit_count || 0),
    totalSpent: Number(item.total_spent || 0),
    createdAt: new Date().toISOString()
  };
}

export async function fetchFullDB(): Promise<DBStructure> {
  const [menuRes, inventoryRes, ordersRes, couponsRes, staffRes, customersRes] = await Promise.all([
    supabase.from("menu").select("*"),
    supabase.from("inventory").select("*"),
    supabase.from("orders").select("*"),
    supabase.from("coupons").select("*"),
    supabase.from("staff").select("*"),
    supabase.from("customers").select("*")
  ]);

  const menuData = menuRes.data || [];
  const inventoryData = inventoryRes.data || [];
  const ordersData = ordersRes.data || [];
  const couponsData = couponsRes.data || [];
  const staffData = staffRes.data || [];
  const customersData = customersRes.data || [];

  // If Supabase is entirely empty, seed it with the current local state
  if (
    menuData.length === 0 &&
    inventoryData.length === 0 &&
    ordersData.length === 0 &&
    couponsData.length === 0 &&
    staffData.length === 0 &&
    customersData.length === 0
  ) {
    console.log("[Supabase] Remote database is empty. Seeding local state to individual tables from client...");
    await Promise.all([
      initialDB.menu.length > 0 ? supabase.from("menu").insert(initialDB.menu.map(mapMenuToSupabase)) : Promise.resolve(),
      initialDB.inventory.length > 0 ? supabase.from("inventory").insert(initialDB.inventory.map(mapInventoryToSupabase)) : Promise.resolve(),
      initialDB.orders.length > 0 ? supabase.from("orders").insert(initialDB.orders.map(mapOrderToSupabase)) : Promise.resolve(),
      initialDB.coupons.length > 0 ? supabase.from("coupons").insert(initialDB.coupons.map(mapCouponToSupabase)) : Promise.resolve(),
      initialDB.staff.length > 0 ? supabase.from("staff").insert(initialDB.staff.map(mapStaffToSupabase)) : Promise.resolve(),
      initialDB.customers.length > 0 ? supabase.from("customers").insert(initialDB.customers.map(mapCustomerToSupabase)) : Promise.resolve()
    ]);
    return initialDB;
  }

  return {
    menu: menuData.map(mapMenuFromSupabase),
    inventory: inventoryData.map(mapInventoryFromSupabase),
    orders: ordersData.map(mapOrderFromSupabase),
    coupons: couponsData.map(mapCouponFromSupabase),
    staff: staffData.map(mapStaffFromSupabase),
    customers: customersData.map(mapCustomerFromSupabase)
  };
}

export async function getSupabaseStatus() {
  try {
    const { data, error } = await supabase.from("staff").select("id").limit(1);
    if (error) {
      return {
        connected: false,
        message: "Supabase connection error: " + error.message,
        lastSynced: null,
        error: error.message,
        project_id: "luoggwvjvxbvprqhvehu"
      };
    }
    return {
      connected: true,
      message: "Directly connected to Supabase Cloud!",
      lastSynced: new Date().toISOString(),
      error: null,
      project_id: "luoggwvjvxbvprqhvehu"
    };
  } catch (err: any) {
    return {
      connected: false,
      message: "Sync failed: " + (err.message || "Unknown error"),
      lastSynced: null,
      error: err.message || "Unknown error",
      project_id: "luoggwvjvxbvprqhvehu"
    };
  }
}

export async function forceSyncSupabase() {
  await fetchFullDB();
  return getSupabaseStatus();
}

// Menu APIs
export async function createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const newItem: MenuItem = {
    id: "m_" + Math.random().toString(36).substr(2, 9),
    name: item.name || "Unnamed Item",
    price: Number(item.price) || 0,
    category: item.category || "Classic Brews",
    description: item.description || "",
    image: item.image || "",
    available: item.available !== undefined ? item.available : true,
    ingredients: item.ingredients || []
  };
  const { error } = await supabase.from("menu").insert([mapMenuToSupabase(newItem)]);
  if (error) throw new Error("Failed to create menu item on Supabase: " + error.message);
  return newItem;
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
  const mapped = mapMenuToSupabase({ id, ...item } as MenuItem);
  const filteredMapped = Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== undefined));
  const { error } = await supabase.from("menu").update(filteredMapped).eq("id", id);
  if (error) throw new Error("Failed to update menu item on Supabase: " + error.message);
  
  const { data, error: fetchErr } = await supabase.from("menu").select("*").eq("id", id).single();
  if (fetchErr || !data) throw new Error("Failed to fetch updated menu item");
  return mapMenuFromSupabase(data);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const { error } = await supabase.from("menu").delete().eq("id", id);
  if (error) throw new Error("Failed to delete menu item from Supabase: " + error.message);
  return true;
}

// Inventory APIs
export async function createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const newItem: InventoryItem = {
    id: "i_" + Math.random().toString(36).substr(2, 9),
    name: item.name || "Unnamed Ingredient",
    currentStock: Number(item.currentStock) || 0,
    unit: item.unit || "Units",
    reorderLevel: Number(item.reorderLevel) || 0,
    lastUpdated: new Date().toISOString()
  };
  const { error } = await supabase.from("inventory").insert([mapInventoryToSupabase(newItem)]);
  if (error) throw new Error("Failed to create inventory item on Supabase: " + error.message);
  return newItem;
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const mapped = mapInventoryToSupabase({ id, ...item, lastUpdated: new Date().toISOString() } as InventoryItem);
  const filteredMapped = Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== undefined));
  const { error } = await supabase.from("inventory").update(filteredMapped).eq("id", id);
  if (error) throw new Error("Failed to update inventory item on Supabase: " + error.message);
  
  const { data, error: fetchErr } = await supabase.from("inventory").select("*").eq("id", id).single();
  if (fetchErr || !data) throw new Error("Failed to fetch updated inventory item");
  return mapInventoryFromSupabase(data);
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const { error } = await supabase.from("inventory").delete().eq("id", id);
  if (error) throw new Error("Failed to delete inventory item: " + error.message);
  return true;
}

// Coupons APIs
export async function createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  const newCoupon: Coupon = {
    id: coupon.code || "CP_" + Math.random().toString(36).substr(2, 9),
    code: coupon.code || "",
    type: coupon.type || "Percentage",
    value: Number(coupon.value) || 0,
    minOrderValue: Number(coupon.minOrderValue) || 0,
    active: coupon.active !== false
  };
  const { error } = await supabase.from("coupons").insert([mapCouponToSupabase(newCoupon)]);
  if (error) throw new Error("Failed to create coupon on Supabase: " + error.message);
  return newCoupon;
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
  const mapped = mapCouponToSupabase({ code: id, ...coupon } as Coupon);
  const filteredMapped = Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== undefined));
  const { error } = await supabase.from("coupons").update(filteredMapped).eq("code", id);
  if (error) throw new Error("Failed to update coupon on Supabase: " + error.message);
  
  const { data, error: fetchErr } = await supabase.from("coupons").select("*").eq("code", id).single();
  if (fetchErr || !data) throw new Error("Failed to fetch updated coupon");
  return mapCouponFromSupabase(data);
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const { error } = await supabase.from("coupons").delete().eq("code", id);
  if (error) throw new Error("Failed to delete coupon: " + error.message);
  return true;
}

// Staff APIs
export async function createStaff(staff: Partial<Staff>): Promise<Staff> {
  const newStaff: Staff = {
    id: "s_" + Math.random().toString(36).substr(2, 9),
    name: staff.name || "New Staff",
    pin: staff.pin || "0000",
    role: staff.role || "Cashier",
    active: staff.active !== false
  };
  const { error } = await supabase.from("staff").insert([mapStaffToSupabase(newStaff)]);
  if (error) throw new Error("Failed to create staff member on Supabase: " + error.message);
  return newStaff;
}

export async function updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
  const mapped = mapStaffToSupabase({ id, ...staff } as Staff);
  const filteredMapped = Object.fromEntries(Object.entries(mapped).filter(([_, v]) => v !== undefined));
  const { error } = await supabase.from("staff").update(filteredMapped).eq("id", id);
  if (error) throw new Error("Failed to update staff member on Supabase: " + error.message);
  
  const { data, error: fetchErr } = await supabase.from("staff").select("*").eq("id", id).single();
  if (fetchErr || !data) throw new Error("Failed to fetch updated staff");
  return mapStaffFromSupabase(data);
}

export async function deleteStaff(id: string): Promise<boolean> {
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw new Error("Failed to delete staff: " + error.message);
  return true;
}

// Customer APIs
export async function createCustomer(customer: { name: string; phone: string; email?: string }): Promise<Customer> {
  const newCustomer: Customer = {
    id: "c_" + Math.random().toString(36).substr(2, 9),
    name: customer.name,
    phone: customer.phone,
    email: customer.email || "",
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString()
  };
  const { error } = await supabase.from("customers").insert([mapCustomerToSupabase(newCustomer)]);
  if (error) throw new Error("Failed to create customer on Supabase: " + error.message);
  return newCustomer;
}

// Checkout API
export interface CheckoutPayload {
  items: { menuItemId: string; name: string; price: number; quantity: number; category: string }[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  paymentMethod: "Cash" | "UPI" | "Card";
  paymentStatus: "Paid" | "Pending";
  staffId: string;
  staffName: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface CheckoutResult {
  success: boolean;
  order: Order;
  warnings: string[];
}

export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  const [menuRes, inventoryRes, customersRes, ordersRes] = await Promise.all([
    supabase.from("menu").select("*"),
    supabase.from("inventory").select("*"),
    supabase.from("customers").select("*"),
    supabase.from("orders").select("*")
  ]);

  const menu = (menuRes.data || []).map(mapMenuFromSupabase);
  const inventory = (inventoryRes.data || []).map(mapInventoryFromSupabase);
  const customers = (customersRes.data || []).map(mapCustomerFromSupabase);
  const orders = (ordersRes.data || []).map(mapOrderFromSupabase);

  // Handle customer registration / updates
  let customerId = payload.customerPhone ? "c_" + Math.random().toString(36).substr(2, 9) : undefined;
  let customerName = payload.customerName;
  let customerPhone = payload.customerPhone;

  if (customerPhone && customerPhone.trim()) {
    const cleanPhone = customerPhone.trim();
    let customerObj = customers.find(c => c.phone === cleanPhone);
    if (!customerObj) {
      customerObj = {
        id: "c_" + Math.random().toString(36).substr(2, 9),
        name: (customerName || "Walk-In Customer").trim(),
        phone: cleanPhone,
        email: payload.customerEmail || "",
        totalOrders: 1,
        totalSpent: Number(payload.total) || 0,
        createdAt: new Date().toISOString()
      };
      await supabase.from("customers").insert([mapCustomerToSupabase(customerObj)]);
    } else {
      customerObj.totalOrders += 1;
      customerObj.totalSpent += Number(payload.total) || 0;
      if (customerName && customerName.trim()) {
        customerObj.name = customerName.trim();
      }
      await supabase.from("customers").update(mapCustomerToSupabase(customerObj)).eq("id", customerObj.id);
    }
    customerId = customerObj.id;
    customerName = customerObj.name;
    customerPhone = customerObj.phone;
  }

  // Generate order number
  const lastOrderNumber = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) : 1000;
  const nextOrderNumber = lastOrderNumber + 1;

  // Compile new order
  const newOrder: Order = {
    id: "o_" + Math.random().toString(36).substr(2, 9),
    orderNumber: nextOrderNumber,
    items: payload.items,
    subtotal: Number(payload.subtotal) || 0,
    discountAmount: Number(payload.discountAmount) || 0,
    couponCode: payload.couponCode,
    total: Number(payload.total) || 0,
    paymentMethod: payload.paymentMethod || "Cash",
    paymentStatus: payload.paymentStatus || "Paid",
    staffId: payload.staffId || "s1",
    staffName: payload.staffName || "Staff",
    customerId,
    customerName,
    customerPhone,
    createdAt: new Date().toISOString()
  };

  // Deduct ingredients from inventory
  const warnings: string[] = [];
  const inventoryUpdates: Promise<any>[] = [];

  newOrder.items.forEach(orderItem => {
    const menuItem = menu.find(m => m.id === orderItem.menuItemId);
    if (menuItem && menuItem.ingredients) {
      menuItem.ingredients.forEach(ingredient => {
        const invItem = inventory.find(i => i.id === ingredient.inventoryId);
        if (invItem) {
          const usage = ingredient.amount * orderItem.quantity;
          invItem.currentStock = Math.max(0, parseFloat((invItem.currentStock - usage).toFixed(3)));
          invItem.lastUpdated = new Date().toISOString();

          // Check if below reorder level
          if (invItem.currentStock <= invItem.reorderLevel) {
            warnings.push(`Low stock warning: ${invItem.name} is down to ${invItem.currentStock} ${invItem.unit}!`);
          }

          // Push update promise
          inventoryUpdates.push(
            Promise.resolve(supabase.from("inventory").update(mapInventoryToSupabase(invItem)).eq("id", invItem.id))
          );
        }
      });
    }
  });

  // Execute inventory updates and order insertion
  await Promise.all([
    ...inventoryUpdates,
    Promise.resolve(supabase.from("orders").insert([mapOrderToSupabase(newOrder)]))
  ]);

  return {
    success: true,
    order: newOrder,
    warnings
  };
}
