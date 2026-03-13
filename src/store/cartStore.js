import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(persist(
  (set, get) => ({
    items: [],

    addItem: (product) => {
      const existing = get().items.find(item => item.id === product.id)
      if (existing) {
        set({
          items: get().items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        })
      } else {
        set({ items: [...get().items, { ...product, quantity: 1 }] })
      }
    },

    updateQuantity: (id, quantity) => {
      set({
        items: get().items
          .map(item => item.id === id ? { ...item, quantity } : item)
          .filter(item => item.quantity > 0)
      })
    },

    removeItem: (id) => {
      set({ items: get().items.filter(item => item.id !== id) })
    },

    clearCart: () => set({ items: [] }),

    getTotal: () => {
      return get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }
  }),
  {
    name: 'lynshop-cart',
    partialize: (state) => ({ items: state.items })
  }
))
