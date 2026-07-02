"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  getPrice: () => "₹0",
  getPriceNum: () => 0,
  getBillingLabel: () => "",
};

/* ── Context ── */
const CartContext = createContext<CartContextType>(defaultContext);

/* ── Provider ── */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [item, setItem] = useState<CartItem | null>(null);

  const addToCart = useCallback((newItem: CartItem) => {
    setItem(newItem);
  }, []);

  const removeFromCart = useCallback(() => {
    setItem(null);
  }, []);

  const clearCart = useCallback(() => {
    setItem(null);
  }, []);

  const updateBilling = useCallback((billing: BillingPeriod) => {
    setItem((prev) => (prev ? { ...prev, billing } : null));
  }, []);

  const getPrice = useCallback((): string => {
    if (!item) return "₹0";
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
