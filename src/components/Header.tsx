'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Flame, Search, User } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <Flame className="w-8 h-8" />
            <span>CrazyPromo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-orange-200 transition-colors">
              Promoções
            </Link>
            <Link href="/comparar" className="hover:text-orange-200 transition-colors">
              ⚖️ Comparar
            </Link>
            <Link href="/categorias" className="hover:text-orange-200 transition-colors">
              Categorias
            </Link>
            <Link href="/lojas" className="hover:text-orange-200 transition-colors">
              Lojas
            </Link>
            <Link href="/melhores" className="hover:text-orange-200 transition-colors">
              🔥 Melhores Ofertas
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/20 rounded-full px-4 py-2">
              <Search className="w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="Buscar promoções..."
                className="bg-transparent border-none outline-none text-white placeholder-white/70 w-48"
              />
            </div>
            
            <Link 
              href="/admin" 
              className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Admin</span>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-4">
              <Link href="/" className="hover:text-orange-200 transition-colors">
                Promoções
              </Link>
              <Link href="/comparar" className="hover:text-orange-200 transition-colors">
                ⚖️ Comparar Preços
              </Link>
              <Link href="/categorias" className="hover:text-orange-200 transition-colors">
                Categorias
              </Link>
              <Link href="/lojas" className="hover:text-orange-200 transition-colors">
                Lojas
              </Link>
              <Link href="/melhores" className="hover:text-orange-200 transition-colors">
                🔥 Melhores Ofertas
              </Link>
              <Link href="/admin" className="hover:text-orange-200 transition-colors">
                Admin
              </Link>
              <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
                <Search className="w-4 h-4 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar promoções..."
                  className="bg-transparent border-none outline-none text-white placeholder-white/70 w-full"
                />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
