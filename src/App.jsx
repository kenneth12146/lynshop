import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import { Home } from './pages/public/Home'
import { Catalog } from './pages/public/Catalog'
import { Cart } from './pages/public/Cart'
import { Checkout } from './pages/public/Checkout'
import { ProductDetail } from './pages/public/ProductDetail'

import { Login } from './pages/admin/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { Products } from './pages/admin/Products'
import { Categories } from './pages/admin/Categories'
import { Configuracion } from './pages/admin/Configuracion'

import { AdminLayout } from './components/admin/AdminLayout'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando LynShop...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/producto/:id" element={<ProductDetail />} />

        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={
          session ? <AdminLayout><Dashboard /></AdminLayout> : <Navigate to="/admin/login" />
        } />
        <Route path="/admin/productos" element={
          session ? <AdminLayout><Products /></AdminLayout> : <Navigate to="/admin/login" />
        } />
        <Route path="/admin/categorias" element={
          session ? <AdminLayout><Categories /></AdminLayout> : <Navigate to="/admin/login" />
        } />
        <Route path="/admin/configuracion" element={
          session ? <AdminLayout><Configuracion /></AdminLayout> : <Navigate to="/admin/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
