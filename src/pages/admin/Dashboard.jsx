import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Package, Tag, ShoppingBag, TrendingUp } from 'lucide-react'

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    lowStock: 0,
    featuredProducts: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: totalCategories },
        { count: featuredProducts },
        { data: lowStock }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('products').select('*, product_images(*)').lt('stock', 5).gt('stock', 0).eq('is_active', true)
      ])

      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalCategories: totalCategories || 0,
        featuredProducts: featuredProducts || 0,
        lowStock: lowStock?.length || 0
      })
      setLowStockProducts(lowStock || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  const getMainImage = (product) => {
    const main = product.product_images?.find(img => img.is_main)
    return main?.image_url || product.product_images?.[0]?.image_url || null
  }

  const statCards = [
    {
      label: 'Total productos',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-pink-50 text-pink-500',
      link: '/admin/productos'
    },
    {
      label: 'Productos activos',
      value: stats.activeProducts,
      icon: ShoppingBag,
      color: 'bg-green-50 text-green-500',
      link: '/admin/productos'
    },
    {
      label: 'Categorías activas',
      value: stats.totalCategories,
      icon: Tag,
      color: 'bg-amber-50 text-amber-500',
      link: '/admin/categorias'
    },
    {
      label: 'Destacados en Home',
      value: stats.featuredProducts,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-500',
      link: '/admin/productos'
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-[#2D2D2D]">Dashboard 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Bienvenida al panel de LynShop</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-pink-50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="bg-white rounded-2xl p-5 shadow-sm border border-pink-50 hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-[#2D2D2D]">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Productos con stock bajo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-[#2D2D2D]">⚡ Stock bajo</h2>
            <Link to="/admin/productos" className="text-xs text-pink-500 hover:underline">
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-pink-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-3xl">✅</span>
              <p className="text-gray-400 text-sm mt-2">Todo el stock está bien</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-50 flex-shrink-0">
                    {getMainImage(product) ? (
                      <img src={getMainImage(product)} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D2D2D] truncate">{product.name}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    product.stock <= 2
                      ? 'bg-red-100 text-red-500'
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {product.stock} restantes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
          <h2 className="font-serif font-bold text-[#2D2D2D] mb-4">🚀 Accesos rápidos</h2>
          <div className="space-y-3">
            <Link
              to="/admin/productos"
              className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 hover:bg-pink-100 transition-all group"
            >
              <div className="w-9 h-9 bg-[#E8A4B8] rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">Agregar producto</p>
                <p className="text-xs text-gray-400">Crear nuevo producto con fotos</p>
              </div>
            </Link>

            <Link
              to="/admin/categorias"
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-all group"
            >
              <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">Nueva categoría</p>
                <p className="text-xs text-gray-400">Organiza tu catálogo</p>
              </div>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-all group"
            >
              <div className="w-9 h-9 bg-green-400 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">Ver tienda</p>
                <p className="text-xs text-gray-400">Como la ve el cliente</p>
              </div>
            </a>

            <Link
              to="/admin/configuracion"
              className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all group"
            >
              <div className="w-9 h-9 bg-purple-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2D2D2D]">Configuración</p>
                <p className="text-xs text-gray-400">WhatsApp y redes sociales</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
