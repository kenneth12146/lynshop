import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Menu } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export const Header = () => {
  const cartItemCount = useCartStore(state => 
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  )

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            LynShop
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pink-500 font-medium transition-colors">Inicio</Link>
            <Link to="/catalogo" className="text-gray-700 hover:text-pink-500 font-medium transition-colors">Catálogo</Link>
            <Link to="/carrito" className="text-gray-700 hover:text-pink-500 font-medium transition-colors">Carrito ({cartItemCount})</Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-500 cursor-pointer hover:text-pink-500" />
            <Link to="/carrito" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-pink-500" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
