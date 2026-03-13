import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Header } from '../../components/Header'
import { useCartStore } from '../../store/cartStore'

export const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <ShoppingBag className="w-24 h-24 text-pink-200 mb-6" />
          <h2 className="text-2xl font-serif font-bold text-gray-400 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-400 mb-8">Agrega productos para continuar</p>
          <Link
            to="/catalogo"
            className="bg-[#E8A4B8] hover:bg-[#d4829a] text-white px-8 py-3 rounded-full font-semibold transition-all"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      {/* BANNER */}
      <div className="bg-gradient-to-r from-[#E8A4B8] to-[#F5E6D3] py-8 px-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-white drop-shadow">
          Mi Carrito 🛒
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50 flex gap-4 items-center"
              >
                {/* Imagen */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2D2D2D] text-sm line-clamp-2 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-[#E8A4B8] font-bold">
                    {formatPrice(item.price)}
                  </p>
                  {item.variant && (
                    <span className="text-xs text-gray-400 bg-pink-50 px-2 py-0.5 rounded-full">
                      {item.variant}
                    </span>
                  )}
                </div>

                {/* Cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-all"
                  >
                    <Minus className="w-3 h-3 text-pink-600" />
                  </button>
                  <span className="w-6 text-center font-semibold text-[#2D2D2D]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-all"
                  >
                    <Plus className="w-3 h-3 text-pink-600" />
                  </button>
                </div>

                {/* Subtotal + eliminar */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[#2D2D2D] text-sm mb-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 sticky top-20">
              <h2 className="text-lg font-serif font-bold text-[#2D2D2D] mb-4">
                Resumen del pedido
              </h2>

              <div className="space-y-2 mb-4 border-b border-pink-50 pb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-500">
                    <span className="line-clamp-1 flex-1 mr-2">{item.name} x{item.quantity}</span>
                    <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-[#2D2D2D] text-lg mb-6">
                <span>Total</span>
                <span className="text-[#E8A4B8]">{formatPrice(getTotal())}</span>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-[#E8A4B8] hover:bg-[#d4829a] text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Finalizar pedido <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/catalogo"
                className="w-full mt-3 border border-pink-200 text-pink-500 hover:bg-pink-50 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
