"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  Category,
  MenuItem,
  ModifierGroup,
  ModifierOption,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
  SelectedModifier,
  Settings,
  StaffUser,
  TableEntity,
  orderTotal,
} from "./types";
import {
  seedCategories,
  seedMenuItems,
  seedModifierGroups,
  seedOrders,
  seedSettings,
  seedStaff,
  seedTables,
} from "./seed";
import { uid } from "./utils";

export interface CartDraft {
  orderId?: string;
  type: OrderType;
  tableId?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
}

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  message: string;
}

interface State {
  isHydrated: boolean;
  currentUser: StaffUser | null;
  loginError: string | null;
  isOnline: boolean;
  categories: Category[];
  menuItems: MenuItem[];
  modifierGroups: ModifierGroup[];
  tables: TableEntity[];
  staff: StaffUser[];
  settings: Settings;
  orders: Order[];
  pendingOrders: Order[];
  cart: CartDraft;
  toasts: Toast[];
}

const emptyCart: CartDraft = {
  type: "dine-in",
  tableId: undefined,
  customerName: "",
  customerPhone: "",
  items: [],
};

const initialState: State = {
  isHydrated: false,
  currentUser: null,
  loginError: null,
  isOnline: true,
  categories: seedCategories,
  menuItems: seedMenuItems,
  modifierGroups: seedModifierGroups,
  tables: seedTables,
  staff: seedStaff,
  settings: seedSettings,
  orders: seedOrders,
  pendingOrders: [],
  cart: emptyCart,
  toasts: [],
};

type Action =
  | { type: "LOGIN"; pin: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_LOGIN_ERROR" }
  | { type: "SET_ONLINE"; online: boolean }
  | { type: "START_CART_FOR_TABLE"; tableId: string }
  | { type: "START_CART_TAPAU" }
  | { type: "LOAD_CART_FROM_ORDER"; orderId: string }
  | { type: "SET_CART_TYPE"; cartType: OrderType }
  | { type: "SET_CART_TABLE"; tableId: string }
  | { type: "SET_CART_CUSTOMER"; name: string; phone: string }
  | { type: "ADD_CART_ITEM"; item: OrderItem }
  | { type: "UPDATE_CART_ITEM_QTY"; itemId: string; qty: number }
  | { type: "REMOVE_CART_ITEM"; itemId: string }
  | { type: "CLEAR_CART" }
  | { type: "SEND_ORDER" }
  | { type: "SET_ORDER_STATUS"; orderId: string; status: OrderStatus }
  | { type: "PAY_ORDER"; orderId: string; method: PaymentMethod; amountReceived?: number }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "ADD_MENU_ITEM"; item: MenuItem }
  | { type: "UPDATE_MENU_ITEM"; item: MenuItem }
  | { type: "DELETE_MENU_ITEM"; id: string }
  | { type: "TOGGLE_AVAILABILITY"; id: string }
  | { type: "ADD_CATEGORY"; category: Category }
  | { type: "RENAME_CATEGORY"; id: string; name: string }
  | { type: "ADD_MODIFIER_GROUP"; group: ModifierGroup }
  | { type: "UPDATE_MODIFIER_GROUP"; group: ModifierGroup }
  | { type: "DELETE_MODIFIER_GROUP"; id: string }
  | { type: "ADD_TABLE"; table: TableEntity }
  | { type: "ADD_STAFF"; staff: StaffUser }
  | { type: "RESET_PIN"; id: string; pin: string }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> }
  | { type: "HYDRATE"; data: Partial<State> };

function toastOf(kind: Toast["kind"], message: string): Toast {
  return { id: uid("toast"), kind, message };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN": {
      const user = state.staff.find((s) => s.pin === action.pin);
      if (!user) {
        return { ...state, loginError: "PIN salah. Sila cuba lagi." };
      }
      return { ...state, currentUser: user, loginError: null };
    }
    case "LOGOUT":
      return { ...state, currentUser: null, cart: emptyCart };
    case "CLEAR_LOGIN_ERROR":
      return { ...state, loginError: null };
    case "SET_ONLINE": {
      if (action.online && !state.isOnline && state.pendingOrders.length > 0) {
        const synced = state.pendingOrders.map((o) => ({ ...o, offlineQueued: false, offlineLate: true }));
        const count = synced.length;
        return {
          ...state,
          isOnline: true,
          orders: [...state.orders, ...synced],
          pendingOrders: [],
          toasts: [...state.toasts, toastOf("success", `${count} order berjaya disync ke kitchen`)],
        };
      }
      return { ...state, isOnline: action.online };
    }
    case "START_CART_FOR_TABLE": {
      const existing = state.orders.find(
        (o) => o.tableId === action.tableId && o.status !== "paid"
      );
      if (existing) {
        return {
          ...state,
          cart: {
            orderId: existing.id,
            type: "dine-in",
            tableId: action.tableId,
            customerName: "",
            customerPhone: "",
            items: [],
          },
        };
      }
      return {
        ...state,
        cart: { type: "dine-in", tableId: action.tableId, customerName: "", customerPhone: "", items: [] },
      };
    }
    case "START_CART_TAPAU":
      return { ...state, cart: { type: "tapau", customerName: "", customerPhone: "", items: [] } };
    case "LOAD_CART_FROM_ORDER": {
      const existing = state.orders.find((o) => o.id === action.orderId);
      if (!existing) return state;
      return {
        ...state,
        cart: {
          orderId: existing.id,
          type: existing.type,
          tableId: existing.tableId,
          customerName: existing.customerName ?? "",
          customerPhone: existing.customerPhone ?? "",
          items: [],
        },
      };
    }
    case "SET_CART_TYPE":
      return {
        ...state,
        cart: { ...state.cart, type: action.cartType, orderId: undefined, tableId: undefined },
      };
    case "SET_CART_TABLE":
      return { ...state, cart: { ...state.cart, tableId: action.tableId } };
    case "SET_CART_CUSTOMER":
      return { ...state, cart: { ...state.cart, customerName: action.name, customerPhone: action.phone } };
    case "ADD_CART_ITEM":
      return { ...state, cart: { ...state.cart, items: [...state.cart.items, action.item] } };
    case "UPDATE_CART_ITEM_QTY":
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items
            .map((it) => (it.id === action.itemId ? { ...it, quantity: action.qty } : it))
            .filter((it) => it.quantity > 0),
        },
      };
    case "REMOVE_CART_ITEM":
      return { ...state, cart: { ...state.cart, items: state.cart.items.filter((it) => it.id !== action.itemId) } };
    case "CLEAR_CART":
      return { ...state, cart: emptyCart };
    case "SEND_ORDER": {
      const cart = state.cart;
      if (cart.items.length === 0) return state;

      if (!state.isOnline) {
        const queuedExisting = state.pendingOrders.find((o) => o.id === cart.orderId);
        if (queuedExisting) {
          const updated: Order = {
            ...queuedExisting,
            items: [...queuedExisting.items, ...cart.items],
            updatedAt: Date.now(),
          };
          return {
            ...state,
            pendingOrders: state.pendingOrders.map((o) => (o.id === updated.id ? updated : o)),
            cart: emptyCart,
          };
        }
        const newOrder: Order = {
          id: cart.orderId ?? uid("order"),
          type: cart.type,
          tableId: cart.type === "dine-in" ? cart.tableId : undefined,
          customerName: cart.type === "tapau" ? cart.customerName : undefined,
          customerPhone: cart.type === "tapau" ? cart.customerPhone : undefined,
          items: cart.items,
          status: "new",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          offlineQueued: true,
        };
        return { ...state, pendingOrders: [...state.pendingOrders, newOrder], cart: emptyCart };
      }

      const existingIdx = state.orders.findIndex((o) => o.id === cart.orderId);
      if (existingIdx >= 0) {
        const existing = state.orders[existingIdx];
        const merged: Order = {
          ...existing,
          items: [...existing.items, ...cart.items],
          status: existing.status === "ready" || existing.status === "served" ? "new" : existing.status,
          updatedAt: Date.now(),
        };
        const orders = [...state.orders];
        orders[existingIdx] = merged;
        return {
          ...state,
          orders,
          cart: emptyCart,
          toasts: [...state.toasts, toastOf("success", "Order dihantar ke Kitchen")],
        };
      }

      const newOrder: Order = {
        id: uid("order"),
        type: cart.type,
        tableId: cart.type === "dine-in" ? cart.tableId : undefined,
        customerName: cart.type === "tapau" ? cart.customerName : undefined,
        customerPhone: cart.type === "tapau" ? cart.customerPhone : undefined,
        items: cart.items,
        status: "new",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        orders: [...state.orders, newOrder],
        cart: emptyCart,
        toasts: [...state.toasts, toastOf("success", "Order dihantar ke Kitchen")],
      };
    }
    case "SET_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status, updatedAt: Date.now() } : o
        ),
      };
    case "PAY_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? {
                ...o,
                status: "paid",
                paymentMethod: action.method,
                amountReceived: action.amountReceived,
                updatedAt: Date.now(),
              }
            : o
        ),
        toasts: [...state.toasts, toastOf("success", "Bill ditutup — pembayaran berjaya")],
      };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "ADD_MENU_ITEM":
      return { ...state, menuItems: [...state.menuItems, action.item] };
    case "UPDATE_MENU_ITEM":
      return { ...state, menuItems: state.menuItems.map((m) => (m.id === action.item.id ? action.item : m)) };
    case "DELETE_MENU_ITEM":
      return { ...state, menuItems: state.menuItems.filter((m) => m.id !== action.id) };
    case "TOGGLE_AVAILABILITY":
      return {
        ...state,
        menuItems: state.menuItems.map((m) => (m.id === action.id ? { ...m, available: !m.available } : m)),
      };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.category] };
    case "RENAME_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.id ? { ...c, name: action.name } : c)),
      };
    case "ADD_MODIFIER_GROUP":
      return { ...state, modifierGroups: [...state.modifierGroups, action.group] };
    case "UPDATE_MODIFIER_GROUP":
      return {
        ...state,
        modifierGroups: state.modifierGroups.map((g) => (g.id === action.group.id ? action.group : g)),
      };
    case "DELETE_MODIFIER_GROUP":
      return { ...state, modifierGroups: state.modifierGroups.filter((g) => g.id !== action.id) };
    case "ADD_TABLE":
      return { ...state, tables: [...state.tables, action.table] };
    case "ADD_STAFF":
      return { ...state, staff: [...state.staff, action.staff] };
    case "RESET_PIN":
      return { ...state, staff: state.staff.map((s) => (s.id === action.id ? { ...s, pin: action.pin } : s)) };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "HYDRATE":
      return { ...state, ...action.data };
    default:
      return state;
  }
}

const STORAGE_KEY = "pos-app-state-v1";

function persistableSlice(state: State) {
  const { isHydrated, toasts, loginError, isOnline, ...rest } = state;
  void isHydrated;
  void toasts;
  void loginError;
  void isOnline;
  return rest;
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Runs once on mount, before the redirect logic in AppShell evaluates
  // `currentUser` — state.isHydrated gates that check so a persisted
  // session isn't bounced to /login during the one-tick gap before this
  // read completes.
  useEffect(() => {
    let data: Partial<State> = {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw);
    } catch {
      // corrupt or unavailable storage — fall back to seed data
    }
    dispatch({ type: "HYDRATE", data: { ...data, isHydrated: true } });
  }, []);

  useEffect(() => {
    if (!state.isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableSlice(state)));
    } catch {
      // storage full/unavailable — persistence is best-effort
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function buildOrderItem(
  menuItem: MenuItem,
  modifiers: SelectedModifier[],
  quantity: number,
  note: string
): OrderItem {
  return {
    id: uid("oi"),
    menuItemId: menuItem.id,
    name: menuItem.name,
    basePrice: menuItem.price,
    modifiers,
    quantity,
    note: note.trim() ? note.trim() : undefined,
  };
}

export { orderTotal };
export type { Order, OrderItem, OrderStatus, OrderType, ModifierOption };
