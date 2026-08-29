"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

/* ── Types ── */
export type BillingPeriod = "daily" | "weekly" | "monthly";

export type PlanCategory = "jobseeker" | "employer" | "business";

export interface CartFeature {
  text: string;
  included: boolean;
}

export interface CartItem {
  id: string;
  tier: string;
  tierClass: string;
  category: PlanCategory;
  categoryLabel: string;
  badge: string | null;
  billing: BillingPeriod;
  priceDaily: string;
  priceWeekly: string;
  priceMonthly: string;
  desc: string;
  features: CartFeature[];
  featured: boolean;
}

export interface CartContextType {
  item: CartItem | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: () => void;
  clearCart: () => void;
  updateBilling: (billing: BillingPeriod) => void;
  getPrice: () => string;
  getPriceNum: () => number;
  getBillingLabel: () => string;
}

/* ── Default no-op context for SSR/prerender ── */
const defaultContext: CartContextType = {
  item: null,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateBilling: () => {},
  getPrice: () => "$0",
  getPriceNum: () => 0,
  getBillingLabel: () => "",
};

/* ── Context ── */
const CartContext = createContext<CartContextType>(defaultContext);

const CART_STORAGE_KEY = "jobnest_cart_item";

/* ── Provider ── */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [item, setItemState] = useState<CartItem | null>(null);

  // Restore cart item from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItemState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    setItemState(newItem);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItem));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, []);

  const removeFromCart = useCallback(() => {
    setItemState(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
  }, []);

  const clearCart = useCallback(() => {
    setItemState(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
  }, []);

  const updateBilling = useCallback((billing: BillingPeriod) => {
    setItemState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, billing };
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const getPrice = useCallback((): string => {
    if (!item) return "$0";
    if (item.billing === "daily") return item.priceDaily;
    if (item.billing === "weekly") return item.priceWeekly;
    return item.priceMonthly;
  }, [item]);

  const getPriceNum = useCallback((): number => {
    const price = getPrice();
    return parseInt(price.replace(/[^\d]/g, ""), 10) || 0;
  }, [getPrice]);

  const getBillingLabel = useCallback((): string => {
    if (!item) return "";
    if (item.billing === "daily") return "/day";
    if (item.billing === "weekly") return "/week";
    return "/month";
  }, [item]);

  return (
    <CartContext.Provider
      value={{
        item,
        addToCart,
        removeFromCart,
        clearCart,
        updateBilling,
        getPrice,
        getPriceNum,
        getBillingLabel,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ── Hook ── */
export const useCart = (): CartContextType => {
  return useContext(CartContext);
};

export default CartContext;
