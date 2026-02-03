import Link from 'next/link'

export default function AdminProdutoDetalhe({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Produto</h1>
        <Link href="/admin/produtos" className="text-orange-600 hover:text-orange-700 font-medium">
          Voltar para produtos →
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-600">
        Detalhes do produto {params.id}. Em breve você poderá editar as informações aqui.
      </div>
    </div>
  )
}
