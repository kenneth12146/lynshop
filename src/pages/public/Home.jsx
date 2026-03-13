import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { Header } from '../../components/Header'
import { supabase } from '../../lib/supabase'
import { useCartStore } from '../../store/cartStore'
import { useSettings } from '../../hooks/useSettings'

export const Home = () => {
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(state => state.addItem)
  const settings = useSettings()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('order_index'),
        supabase.from('products')
          .select('*, product_images(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .limit(8)
      ])
      setCategories(cats || [])
      setFeaturedProducts(prods || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const getMainImage = (product) => {
    const main = product.product_images?.find(img => img.is_main)
    return main?.image_url || product.product_images?.[0]?.image_url || '/placeholder.jpg'
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      {/* HERO BANNER */}
      <section className="relative bg-gradient-to-br from-[#E8A4B8] via-[#F5E6D3] to-[#FAFAFA] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow mb-4 leading-tight">
              Nueva Colección 2026
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 font-light">
              {settings.welcome_message || 'Descubre piezas únicas para ti'}
            </p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-[#D97706] hover:bg-[#b45309] text-white px-8 py-3 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Ver Catálogo <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Decoración */}
        <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none">
          <div className="w-40 h-40 rounded-full bg-white absolute top-8 right-8"></div>
          <div className="w-24 h-24 rounded-full bg-pink-300 absolute top-32 right-32"></div>
          <div className="w-16 h-16 rounded-full bg-rose-200 absolute bottom-8 right-16"></div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-serif font-bold text-[#2D2D2D] mb-6 text-center">Categorías</h2>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[140px] h-36 bg-pink-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.slug}`}
                className="min-w-[140px] flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-pink-50 hover:border-[#E8A4B8] transition-all hover:scale-105 group"
              >
                {cat.image_url ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 mb-3">
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl mb-3 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-pink-400" />
                  </div>
                )}
                <span className="text-sm font-medium text-[#2D2D2D] group-hover:text-pink-500 text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No hay categorías aún</p>
        )}
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <h2 className="text-2xl font-serif font-bold text-[#2D2D2D] mb-6 text-center">Productos Destacados ⭐</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group relative overflow-hidden border border-pink-50"
              >
                {product.stock < 5 && product.stock > 0 && (
                  <span className="absolute top-2 left-2 z-10 bg-[#C9A96E] text-white text-xs font-bold px-2 py-1 rounded-full">
                    OFERTA
                  </span>
                )}
                <Link to={`/producto/${product.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getMainImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/producto/${product.id}`}>
                    <h3 className="font-semibold text-[#2D2D2D] text-sm mb-1 hover:text-pink-500 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[#E8A4B8] font-bold text-base mb-3">{formatPrice(product.price)}</p>
                  <button
                    onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: getMainImage(product)
                    })}
                    className="w-full bg-[#E8A4B8] hover:bg-[#d4829a] text-white py-2 px-3 rounded-xl text-sm font-semibold transition-all"
                  >
                    Agregar al carrito +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-pink-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay productos destacados aún</p>
            <p className="text-gray-300 text-sm">Agrégalos desde el panel admin</p>
          </div>
        )}
      </section>

      {/* FOOTER DINÁMICO */}
      <footer className="bg-[#2D2D2D] text-white py-8">
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
