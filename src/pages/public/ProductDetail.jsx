import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react'
import { Header } from '../../components/Header'
import { supabase } from '../../lib/supabase'
import { useCartStore } from '../../store/cartStore'
import { useSettings } from '../../hooks/useSettings'

export const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(state => state.addItem)
  const settings = useSettings()

  useEffect(() => {
    const fetchProduct = async () => {
      const [{ data: prod }, { data: imgs }, { data: vars }] = await Promise.all([
        supabase.from('products').select('*, categories(name)').eq('id', id).single(),
        supabase.from('product_images').select('*').eq('product_id', id).order('order_index'),
        supabase.from('product_variants').select('*').eq('product_id', id).eq('is_active', true)
      ])
      setProduct(prod)
      setImages(imgs || [])
      setVariants(vars || [])
      const main = imgs?.find(img => img.is_main) || imgs?.[0]
      setSelectedImage(main?.image_url || null)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!product) return
    const finalPrice = selectedVariant ? product.price + selectedVariant.extra_price : product.price
    const variantText = selectedVariant ? `${selectedVariant.variant_type}: ${selectedVariant.variant_value}` : null
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: selectedImage || '/placeholder.jpg',
      variant: variantText
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const groupedVariants = variants.reduce((acc, v) => {
    if (!acc[v.variant_type]) acc[v.variant_type] = []
    acc[v.variant_type].push(v)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-pink-100 rounded-2xl animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-pink-100 rounded-xl animate-pulse"></div>
              <div className="h-6 bg-pink-100 rounded-xl w-1/2 animate-pulse"></div>
              <div className="h-24 bg-pink-100 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <span className="text-6xl mb-4">😕</span>
          <p className="text-gray-400 text-lg">Producto no encontrado</p>
          <button onClick={() => navigate('/catalogo')} className="mt-4 text-pink-500 hover:underline">
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* GALERÍA */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 flex items-center justify-center">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-pink-50 ${
                      selectedImage === img.image_url ? 'border-[#E8A4B8] scale-105' : 'border-transparent hover:border-pink-200'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-5">
            {product.categories && (
              <span className="text-xs font-semibold text-[#C9A96E] bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wide">
                {product.categories.name}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2D2D2D]">{product.name}</h1>
            <p className="text-3xl font-bold text-[#E8A4B8]">
              {formatPrice(selectedVariant ? product.price + selectedVariant.extra_price : product.price)}
            </p>
            <div>
              {product.stock === 0 ? (
                <span className="text-sm text-red-400 font-medium">❌ Agotado</span>
              ) : product.stock < 5 ? (
                <span className="text-sm text-amber-500 font-medium">⚡ Últimas {product.stock} unidades</span>
              ) : (
                <span className="text-sm text-green-500 font-medium">✅ Disponible</span>
              )}
            </div>
            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            )}
            {Object.entries(groupedVariants).map(([type, values]) => (
              <div key={type}>
                <p className="text-sm font-semibold text-[#2D2D2D] mb-2 capitalize">{type}:</p>
                <div className="flex gap-2 flex-wrap">
                  {values.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      disabled={v.stock === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        v.stock === 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : selectedVariant?.id === v.id ? 'border-[#E8A4B8] bg-[#E8A4B8] text-white'
                          : 'border-pink-100 text-gray-600 hover:border-pink-300'
                      }`}
                    >
                      {v.variant_value}
                      {v.extra_price > 0 && <span className="ml-1 text-xs opacity-70">+{formatPrice(v.extra_price)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-md ${
                product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : added ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-[#E8A4B8] text-white hover:bg-[#d4829a] hover:shadow-lg'
              }`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> ¡Agregado al carrito!</>
              ) : product.stock === 0 ? 'Producto agotado' : (
                <><ShoppingCart className="w-5 h-5" /> Agregar al carrito</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER DINÁMICO */}
      <footer className="bg-[#2D2D2D] text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xl font-serif font-bold text-pink-300">{settings.store_name}</p>
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full font-semibold transition-all"
          >
            📱 Contáctanos por WhatsApp
          </a>
          <div className="flex gap-4 text-gray-400 text-sm">
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-pink-400 transition-colors">Instagram</a>
            <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-pink-400 transition-colors">Facebook</a>
            <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-pink-400 transition-colors">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
