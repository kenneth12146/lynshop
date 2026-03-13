import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '../../components/Header'
import { supabase } from '../../lib/supabase'
import { useCartStore } from '../../store/cartStore'
import { useSettings } from '../../hooks/useSettings'

export const Catalog = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')
  const [searchParams] = useSearchParams()
  const addItem = useCartStore(state => state.addItem)
  const settings = useSettings()

  useEffect(() => {
    const catSlug = searchParams.get('categoria')
    if (catSlug) {
      const findCategory = async () => {
        const { data } = await supabase
          .from('categories').select('*').eq('slug', catSlug).single()
        if (data) setSelectedCategory(data.id)
      }
      findCategory()
    }
  }, [searchParams])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories').select('*').eq('is_active', true).order('order_index')
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('is_active', true)
        .order(sortBy, { ascending: sortBy === 'name' })
      if (selectedCategory) query = query.eq('category_id', selectedCategory)
      if (search.trim()) query = query.ilike('name', `%${search}%`)
      const { data } = await query
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [selectedCategory, search, sortBy])

  const getMainImage = (product) => {
    const main = product.product_images?.find(img => img.is_main)
    return main?.image_url || product.product_images?.[0]?.image_url || null
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <div className="bg-gradient-to-r from-[#E8A4B8] to-[#F5E6D3] py-8 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow">Catálogo 🛍️</h1>
        <p className="text-white/80 mt-1">Encuentra tu pieza perfecta</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* BUSCADOR + ORDENAR */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:border-pink-400 bg-white shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-pink-500" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white border border-pink-100 rounded-xl px-4 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="py-3 bg-transparent focus:outline-none text-gray-600 text-sm"
            >
              <option value="created_at">Más nuevos</option>
              <option value="price">Menor precio</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* FILTRO CATEGORÍAS */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`min-w-fit px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              !selectedCategory ? 'bg-[#E8A4B8] text-white border-[#E8A4B8]' : 'bg-white text-gray-600 border-pink-100 hover:border-pink-300'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`min-w-fit px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedCategory === cat.id ? 'bg-[#E8A4B8] text-white border-[#E8A4B8]' : 'bg-white text-gray-600 border-pink-100 hover:border-pink-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* RESULTADOS */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-pink-50"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-4">{products.length} productos encontrados</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group relative overflow-hidden border border-pink-50"
                >
                  {product.stock < 5 && product.stock > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-[#C9A96E] text-white text-xs font-bold px-2 py-1 rounded-full">OFERTA</span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">AGOTADO</span>
                  )}
                  <Link to={`/producto/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-pink-50">
                      {getMainImage(product) ? (
                        <img
                          src={getMainImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🛍️</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link to={`/producto/${product.id}`}>
                      <h3 className="font-semibold text-[#2D2D2D] text-sm mb-1 line-clamp-2 hover:text-pink-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[#E8A4B8] font-bold text-base mb-3">{formatPrice(product.price)}</p>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => product.stock > 0 && addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: getMainImage(product)
                      })}
                      className={`w-full py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                        product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#E8A4B8] hover:bg-[#d4829a] text-white'
                      }`}
                    >
                      {product.stock === 0 ? 'Agotado' : 'Agregar al carrito +'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl">🔍</span>
            <p className="text-gray-400 text-lg mt-4">No se encontraron productos</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory(null) }}
              className="mt-4 text-pink-500 hover:underline text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* FOOTER DINÁMICO */}
      <footer className="bg-[#2D2D2D] text-white py-8 mt-12">
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
