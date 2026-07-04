import {
  Category,
  MenuItem,
  ModifierGroup,
  Order,
  Settings,
  StaffUser,
  TableEntity,
} from "./types";

export const seedCategories: Category[] = [
  { id: "cat-nasi", name: "Nasi", order: 0 },
  { id: "cat-mee", name: "Mee", order: 1 },
  { id: "cat-minuman", name: "Minuman", order: 2 },
  { id: "cat-dessert", name: "Dessert", order: 3 },
];

export const seedMenuItems: MenuItem[] = [
  { id: "item-nasi-goreng-ayam", name: "Nasi Goreng Ayam", price: 8.0, categoryId: "cat-nasi", available: true },
  { id: "item-nasi-lemak", name: "Nasi Lemak", price: 6.5, categoryId: "cat-nasi", available: true },
  { id: "item-nasi-ayam-penyet", name: "Nasi Ayam Penyet", price: 9.5, categoryId: "cat-nasi", available: true },
  { id: "item-nasi-goreng-kampung", name: "Nasi Goreng Kampung", price: 7.5, categoryId: "cat-nasi", available: true },
  { id: "item-nasi-briyani", name: "Nasi Briyani", price: 10.0, categoryId: "cat-nasi", available: false },
  { id: "item-nasi-kerabu", name: "Nasi Kerabu", price: 8.5, categoryId: "cat-nasi", available: true },
  { id: "item-nasi-goreng-seafood", name: "Nasi Goreng Seafood", price: 11.0, categoryId: "cat-nasi", available: true },
  { id: "item-nasi-goreng-usa", name: "Nasi Goreng USA", price: 9.0, categoryId: "cat-nasi", available: true },
  { id: "item-mee-goreng", name: "Mee Goreng", price: 7.0, categoryId: "cat-mee", available: true },
  { id: "item-mee-kuah", name: "Mee Kuah", price: 6.5, categoryId: "cat-mee", available: true },
  { id: "item-mee-hoon-goreng", name: "Mee Hoon Goreng", price: 6.5, categoryId: "cat-mee", available: true },
  { id: "item-teh-ais", name: "Teh Ais", price: 2.5, categoryId: "cat-minuman", available: true },
  { id: "item-air-bandung", name: "Air Bandung", price: 3.0, categoryId: "cat-minuman", available: true },
  { id: "item-kopi-o", name: "Kopi O", price: 2.2, categoryId: "cat-minuman", available: true },
  { id: "item-cendol", name: "Cendol", price: 4.5, categoryId: "cat-dessert", available: true },
  { id: "item-ice-kacang", name: "Ice Kacang", price: 5.0, categoryId: "cat-dessert", available: true },
];

export const seedModifierGroups: ModifierGroup[] = [
  {
    id: "mod-pedas",
    name: "Tahap pedas",
    selectionType: "single",
    categoryIds: ["cat-nasi", "cat-mee"],
    options: [
      { id: "opt-kurang-cili", name: "Kurang cili", priceDelta: 0 },
      { id: "opt-biasa", name: "Biasa", priceDelta: 0 },
      { id: "opt-extra-cili", name: "Extra cili", priceDelta: 0 },
    ],
  },
  {
    id: "mod-sayur",
    name: "Sayur",
    selectionType: "single",
    categoryIds: ["cat-nasi", "cat-mee"],
    options: [
      { id: "opt-dengan-sayur", name: "Dengan sayur", priceDelta: 0 },
      { id: "opt-taknak-sayur", name: "Taknak sayur", priceDelta: 0 },
    ],
  },
  {
    id: "mod-tambah",
    name: "Tambah",
    selectionType: "multi",
    categoryIds: ["cat-nasi", "cat-mee"],
    options: [
      { id: "opt-extra-ayam", name: "Extra ayam", priceDelta: 3.0 },
      { id: "opt-extra-telur", name: "Extra telur", priceDelta: 1.5 },
      { id: "opt-less-rice", name: "Less rice", priceDelta: -1.0 },
    ],
  },
  {
    id: "mod-manis",
    name: "Tahap manis",
    selectionType: "single",
    categoryIds: ["cat-minuman", "cat-dessert"],
    options: [
      { id: "opt-kurang-manis", name: "Kurang manis", priceDelta: 0 },
      { id: "opt-manis-biasa", name: "Manis biasa", priceDelta: 0 },
    ],
  },
];

export const seedTables: TableEntity[] = [
  { id: "table-1", name: "Meja 1" },
  { id: "table-2", name: "Meja 2" },
  { id: "table-3", name: "Meja 3" },
  { id: "table-4", name: "Meja 4" },
  { id: "table-5", name: "Meja 5" },
  { id: "table-6", name: "Meja 6" },
];

export const seedStaff: StaffUser[] = [
  { id: "staff-ali", name: "Ali", pin: "1234", role: "admin" },
  { id: "staff-mira", name: "Mira", pin: "1111", role: "staff" },
  { id: "staff-farid", name: "Farid", pin: "2222", role: "staff" },
];

export const seedSettings: Settings = {
  restaurantName: "Restoran Adeq Tomyam",
  address: "12 Jalan Sedap, Petaling Jaya",
  taxServiceEnabled: true,
  taxServicePercent: 10,
};

const now = Date.now();
const minsAgo = (m: number) => now - m * 60 * 1000;

export const seedOrders: Order[] = [
  {
    id: "order-meja2",
    type: "dine-in",
    tableId: "table-2",
    items: [
      {
        id: "oi-1",
        menuItemId: "item-mee-goreng",
        name: "Mee Goreng",
        basePrice: 7.0,
        modifiers: [],
        quantity: 1,
      },
      {
        id: "oi-2",
        menuItemId: "item-air-bandung",
        name: "Air Bandung",
        basePrice: 3.0,
        modifiers: [],
        quantity: 1,
      },
    ],
    status: "cooking",
    createdAt: minsAgo(12),
    updatedAt: minsAgo(12),
  },
  {
    id: "order-meja3",
    type: "dine-in",
    tableId: "table-3",
    items: [
      {
        id: "oi-3",
        menuItemId: "item-nasi-lemak",
        name: "Nasi Lemak",
        basePrice: 6.5,
        modifiers: [],
        quantity: 2,
      },
      {
        id: "oi-4",
        menuItemId: "item-teh-ais",
        name: "Teh Ais",
        basePrice: 2.5,
        modifiers: [],
        quantity: 2,
      },
    ],
    status: "ready",
    createdAt: minsAgo(6),
    updatedAt: minsAgo(2),
  },
  {
    id: "order-meja6",
    type: "dine-in",
    tableId: "table-6",
    items: [
      {
        id: "oi-5",
        menuItemId: "item-nasi-goreng-seafood",
        name: "Nasi Goreng Seafood",
        basePrice: 11.0,
        modifiers: [],
        quantity: 2,
      },
      {
        id: "oi-6",
        menuItemId: "item-teh-ais",
        name: "Teh Ais",
        basePrice: 2.5,
        modifiers: [],
        quantity: 4,
      },
    ],
    status: "served",
    createdAt: minsAgo(20),
    updatedAt: minsAgo(10),
  },
  {
    id: "order-tapau-siti",
    type: "tapau",
    customerName: "Siti",
    customerPhone: "012-3456789",
    items: [
      {
        id: "oi-7",
        menuItemId: "item-nasi-lemak",
        name: "Nasi Lemak",
        basePrice: 6.5,
        modifiers: [
          { groupId: "mod-tambah", groupName: "Tambah", optionId: "opt-extra-telur", optionName: "Extra telur", priceDelta: 1.5 },
        ],
        quantity: 1,
        note: "pisah bungkus",
      },
    ],
    status: "cooking",
    createdAt: minsAgo(4),
    updatedAt: minsAgo(4),
  },
  {
    id: "order-tapau-farid",
    type: "tapau",
    customerName: "Farid",
    customerPhone: "019-8887766",
    items: [
      {
        id: "oi-8",
        menuItemId: "item-mee-goreng",
        name: "Mee Goreng",
        basePrice: 7.0,
        modifiers: [],
        quantity: 1,
        note: "",
      },
    ],
    status: "ready",
    createdAt: minsAgo(9),
    updatedAt: minsAgo(3),
  },
];
