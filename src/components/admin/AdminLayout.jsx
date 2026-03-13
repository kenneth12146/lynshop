import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  LayoutDashboard, Package, Tag,
  Settings, LogOut, Menu, Store
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/productos', icon: Package, label: 'Productos' },
  { to: '/admin/categorias', icon: Tag, label: 'Categorías' },
  { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
]

// ← Sidebar FUERA del componente AdminLayout
const Sidebar = ({ storeSettings, onNavigate, onLogout }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-pink-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
          {storeSettings.logo_url ? (
            <img src={storeSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <Store className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h1 className="font-serif font-bold text-[#2D2D2D] text-lg leading-none">
            {storeSettings.store_name}
          </h1>
          <p className="text-xs text-gray-400">Panel Admin</p>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-[#E8A4B8] text-white shadow-sm'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-500'
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Ver tienda + Logout */}
    <div className="p-4 border-t border-pink-100 space-y-2">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-pink-50 hover:text-pink-500 transition-all"
      >
        <Store className="w-5 h-5" /> Ver tienda
      </a>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-400 transition-all"
      >
        <LogOut className="w-5 h-5" /> Cerrar sesión
      </button>
    </div>
  </div>
)

export const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'LynShop',
    logo_url: null
  })

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('store_name, logo_url')
        .single()
      if (data) {
        setStoreSettings({
          store_name: data.store_name || 'LynShop',
          logo_url: data.logo_url || null
        })
      }
    }
    fetchSettings()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-pink-100 fixed h-full z-30">
        <Sidebar
          storeSettings={storeSettings}
          onNavigate={() => {}}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl z-50">
            <Sidebar
              storeSettings={storeSettings}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 md:ml-64">

        {/* Header móvil */}
        <div className="md:hidden bg-white border-b border-pink-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-pink-500">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-serif font-bold text-[#2D2D2D]">{storeSettings.store_name}</h1>
        </div>

        {/* Página */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
