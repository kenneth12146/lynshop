import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header'
import { useCartStore } from '../../store/cartStore'
import { CheckCircle } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'

export const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore()
  const navigate = useNavigate()
  const settings = useSettings()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: '',
    payment_method: '',
    note: ''
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(price)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const sendToWhatsApp = () => {
    const phone = settings.whatsapp_number || '573000000000'
    const baseUrl = window.location.origin

    const productList = items
      .map(i =>
        `  • ${i.name}${i.variant ? ` (${i.variant})` : ''} x${i.quantity} — ${formatPrice(i.price * i.quantity)}\n    🔗 ${baseUrl}/producto/${i.id}`
      )
      .join('\n')

    const message =
`🛍️ *NUEVO PEDIDO*

👤 *Cliente:* ${form.customer_name}
📞 *Teléfono:* ${form.phone}
📍 *Dirección:* ${form.address}
💳 *Método de pago:* ${form.payment_method}

🛒 *Productos:*
${productList}

💰 *Total: ${formatPrice(getTotal())}*${form.note ? `\n\n📝 *Nota:* ${form.note}` : ''}`

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.customer_name || !form.phone || !form.address || !form.payment_method) return
    setLoading(true)
    setTimeout(() => {
      sendToWhatsApp()
      clearCart()
      setSuccess(true)
      setLoading(false)
    }, 800)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <CheckCircle className="w-24 h-24 text-green-400 mb-6" />
          <h2 className="text-3xl font-serif font-bold text-[#2D2D2D] mb-2">¡Pedido enviado! 🎉</h2>
          <p className="text-gray-400 max-w-md mb-8">
            Tu pedido fue enviado por WhatsApp. Nuestra asesora te contactará pronto para coordinar el pago y envío.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#E8A4B8] hover:bg-[#d4829a] text-white px-8 py-3 rounded-full font-semibold transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <div className="bg-gradient-to-r from-[#E8A4B8] to-[#F5E6D3] py-8 px-4 text-center">
        <h1 className="text-3xl font-serif font-bold text-white drop-shadow">Finalizar Pedido 📦</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* FORMULARIO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
            <h2 className="text-lg font-serif font-bold text-[#2D2D2D] mb-4">📋 Tus datos</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre completo *</label>
                <input
                  type="text" name="customer_name" value={form.customer_name}
                  onChange={handleChange} required placeholder="Ej: Laura Martínez"
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">WhatsApp / Teléfono *</label>
                <input
                  type="tel" name="phone" value={form.phone}
                  onChange={handleChange} required placeholder="Ej: 3156789012"
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Dirección de entrega *</label>
                <textarea
                  name="address" value={form.address} onChange={handleChange}
                  required rows={2} placeholder="Ej: Cra 45 #72-30, Barranquilla"
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Método de pago *</label>
                <select
                  name="payment_method" value={form.payment_method}
                  onChange={handleChange} required
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm bg-white"
                >
                  <option value="">Selecciona un método</option>
                  <option value="Nequi">💜 Nequi</option>
                  <option value="Bancolombia">🏦 Bancolombia</option>
                  <option value="Daviplata">🟡 Daviplata</option>
                  <option value="Contra entrega">🚚 Contra entrega</option>
                  <option value="Efectivo">💵 Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nota adicional (opcional)</label>
                <textarea
                  name="note" value={form.note} onChange={handleChange}
                  rows={2} placeholder="Ej: Por favor empacar bonito, es un regalo 🎁"
                  className="w-full border border-pink-100 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 text-sm resize-none"
                />
              </div>

              {/* ← SPINNER CSS en vez de <Loader> de lucide */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E8A4B8] hover:bg-[#d4829a] disabled:bg-pink-200 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md text-base"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>📲 Enviar pedido por WhatsApp</>
                )}
              </button>
            </form>
          </div>

          {/* RESUMEN */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 h-fit sticky top-20">
            <h2 className="text-lg font-serif font-bold text-[#2D2D2D] mb-4">🛍️ Tu pedido</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-pink-50 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2D2D] line-clamp-1">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-[#E8A4B8] flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-pink-50 pt-4 flex justify-between items-center">
              <span className="font-bold text-[#2D2D2D]">Total</span>
              <span className="text-xl font-bold text-[#E8A4B8]">{formatPrice(getTotal())}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
