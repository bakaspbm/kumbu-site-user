"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { syncCartAction } from "@/app/actions/cart";
import {
  cartTotalQuantity,
  formatCartTotalLabel,
  formatItemsTotalLabel,
  groupCartBySeller,
} from "@/lib/cart-utils";
import { newOrderId } from "@/lib/ids";
import {
  checkoutOrders,
  createOrder,
  ensureProductConversation,
  sendConversationMessage,
  syncCart,
} from "@/lib/site-data";
import { useAuth } from "@/contexts/auth-context";
import type { CartItem, CatalogProduct } from "@/types/store";

const CART_KEY_PREFIX = "kumbu-cart-v2";

export type CheckoutResult = {
  orderIds: string[];
  /** Uma conversa por vendedor (primeiro artigo do grupo). */
  conversationIds: string[];
};

interface CartContextValue {
  items: CartItem[];
  count: number;
  totalLabel: string;
  isSyncing: boolean;
  addProduct: (product: CatalogProduct, qty?: number) => boolean;
  removeProduct: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  checkout: () => Promise<CheckoutResult>;
  loadFromServer: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartStorageKey(userId: string | null) {
  return userId ? `${CART_KEY_PREFIX}:${userId}` : `${CART_KEY_PREFIX}:guest`;
}

function loadLocal(userId: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(cartStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveLocal(userId: string | null, items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartStorageKey(userId), JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, storeUser, user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const serverLoadedForUser = useRef<string | null>(null);
  const syncUserIdRef = useRef<string | null>(null);

  const userId = user?.id ?? null;

  useEffect(() => {
    setItems(loadLocal(userId));
    setHydrated(true);
  }, [userId]);

  const loadFromServer = useCallback(async () => {
    if (!isLoggedIn || !userId) return;
    if (storeUser?.cart && storeUser.cart.length > 0) {
      setItems(storeUser.cart);
      saveLocal(userId, storeUser.cart);
    }
  }, [isLoggedIn, storeUser?.cart, userId]);

  useEffect(() => {
    if (authLoading || !hydrated) return;

    if (!isLoggedIn || !userId) {
      serverLoadedForUser.current = null;
      syncUserIdRef.current = null;
      return;
    }

    if (serverLoadedForUser.current === userId) return;

    serverLoadedForUser.current = userId;
    syncUserIdRef.current = userId;

    if (storeUser && storeUser.id === userId) {
      if (storeUser.cart.length > 0) {
        setItems(storeUser.cart);
        saveLocal(userId, storeUser.cart);
      }
    }
  }, [authLoading, hydrated, isLoggedIn, userId, storeUser]);

  useEffect(() => {
    if (!hydrated) return;
    saveLocal(userId, items);

    if (!isLoggedIn || !userId) return;
    if (syncUserIdRef.current !== userId) return;

    const syncForUser = userId;
    const t = window.setTimeout(async () => {
      if (syncUserIdRef.current !== syncForUser) return;
      setIsSyncing(true);
      try {
        await syncCartAction(items);
      } catch {
      } finally {
        if (syncUserIdRef.current === syncForUser) setIsSyncing(false);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [items, hydrated, isLoggedIn, userId]);

  const addProduct = useCallback(
    (product: CatalogProduct, qty = 1) => {
      if (product.isOutOfStock) return false;
      if (!product.sellerId) return false;
      if (user?.id && product.sellerId === user.id) {
        return false;
      }
      setItems((prev) => {
        const i = prev.findIndex((x) => x.productId === product.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + qty };
          return next;
        }
        return [
          ...prev,
          {
            productId: product.id,
            sellerId: product.sellerId,
            quantity: qty,
            title: product.title,
            priceLabel: product.priceLabel,
            imageUrl: product.imageUrl,
          },
        ];
      });
      return true;
    },
    [user?.id],
  );

  const removeProduct = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity } : x)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const checkout = useCallback(async () => {
    if (items.length === 0) throw new Error("Carrinho vazio.");
    const result = await checkoutOrders(items);
    setItems([]);
    serverLoadedForUser.current = null;
    return { orderIds: result.orderIds, conversationIds: result.conversationIds };
  }, [items]);

  const count = useMemo(() => cartTotalQuantity(items), [items]);
  const totalLabel = useMemo(() => formatCartTotalLabel(items), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      totalLabel,
      isSyncing,
      addProduct,
      removeProduct,
      setQuantity,
      clear,
      checkout,
      loadFromServer,
    }),
    [
      items,
      count,
      totalLabel,
      isSyncing,
      addProduct,
      removeProduct,
      setQuantity,
      clear,
      checkout,
      loadFromServer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
