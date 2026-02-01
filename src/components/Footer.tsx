import Link from 'next/link'
import { Flame, Mail, Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <span>CrazyPromo</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Encontre as melhores promoções de verdade! Nosso sistema inteligente analisa 
              o histórico de preços para garantir que você está fazendo um bom negócio.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="hover:text-orange-500 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/como-funciona" className="hover:text-orange-500 transition-colors">Como Funciona</Link></li>
              <li><Link href="/contato" className="hover:text-orange-500 transition-colors">Contato</Link></li>
              <li><Link href="/privacidade" className="hover:text-orange-500 transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li><Link href="/categoria/eletronicos" className="hover:text-orange-500 transition-colors">Eletrônicos</Link></li>
              <li><Link href="/categoria/casa" className="hover:text-orange-500 transition-colors">Casa & Decoração</Link></li>
              <li><Link href="/categoria/moda" className="hover:text-orange-500 transition-colors">Moda</Link></li>
              <li><Link href="/categoria/games" className="hover:text-orange-500 transition-colors">Games</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>© 2024 CrazyPromo. Todos os direitos reservados.</p>
          <p className="mt-2 text-sm">
            * Alguns links podem conter programas de afiliados. Isso não afeta o preço final do produto.
          </p>
        </div>
      </div>
    </footer>
  )
}
