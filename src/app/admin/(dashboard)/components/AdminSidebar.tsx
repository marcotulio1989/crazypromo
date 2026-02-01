'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Flame, 
  LayoutDashboard, 
  Tag, 
  Package, 
  Store, 
  FolderTree,
  BarChart3,
  Settings,
  LogOut,
  Link as LinkIcon
} from 'lucide-react'

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/promocoes', label: 'Promoções', icon: Tag },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/lojas', label: 'Lojas & Afiliados', icon: Store },
  { href: '/admin/categorias', label: 'Categorias', icon: FolderTree },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Flame className="w-8 h-8 text-orange-500" />
          <span>CrazyPromo</span>
        </Link>
        <p className="text-gray-500 text-sm mt-1">Painel Admin</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="mb-4 px-4">
          <p className="font-medium text-white truncate">{user.name || 'Admin'}</p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
