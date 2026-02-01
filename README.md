# CrazyPromo 🔥

Sistema inteligente de promoções com links de afiliados que analisa histórico de preços para identificar promoções reais e detectar manipulações de preços.

## 🚀 Funcionalidades

### Para Usuários
- ✅ Visualizar promoções verificadas
- ✅ Ver histórico de preços dos produtos
- ✅ Deal Score - pontuação de qualidade da promoção (0-100)
- ✅ Filtrar por categoria, loja e desconto mínimo
- ✅ Identificar promoções falsas vs reais

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ Gerenciar lojas e configurações de afiliados
- ✅ Cadastrar produtos com monitoramento de preços
- ✅ Criar promoções com análise automática
- ✅ Rastreamento de cliques nos links

### Sistema Inteligente
- 🧠 Análise de histórico de preços
- 🔍 Detecção de manipulação de preços
- 📊 Cálculo de Deal Score baseado em dados reais
- ⚠️ Alertas para promoções duvidosas

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 📦 Instalação

### 1. Pré-requisitos
- Node.js 18+
- Docker (para PostgreSQL)

### 2. Clonar e instalar dependências

```bash
git clone https://github.com/seu-usuario/crazypromo.git
cd crazypromo
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Iniciar banco de dados

```bash
docker-compose up -d
```

### 5. Criar tabelas e popular dados iniciais

```bash
npx prisma migrate dev
npx prisma db seed
```

### 6. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## 🔐 Acesso Admin

Após rodar o seed, use as credenciais padrão:
- **Email**: admin@crazypromo.com
- **Senha**: admin123

⚠️ **Mude essas credenciais em produção!**

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/           # API Routes
│   ├── admin/         # Painel administrativo
│   ├── promocoes/     # Página de promoções
│   └── page.tsx       # Página inicial
├── components/        # Componentes React
├── lib/
│   ├── prisma.ts      # Cliente Prisma
│   ├── auth.ts        # Configuração NextAuth
│   ├── price-analyzer.ts        # Sistema de análise de preços
│   └── affiliate-link-generator.ts  # Gerador de links de afiliados
└── types/             # Tipos TypeScript
```

## 🔗 Configuração de Afiliados

### Lojas Suportadas

O sistema suporta diferentes formatos de links de afiliados:

1. **Query Parameter** (Amazon, Kabum, etc.)
   - URL + ?tag=SEU_ID

2. **Custom Template** (AliExpress, redes de afiliados)
   - Templates personalizados com {url} e {affiliateId}

### Como Configurar

1. Acesse o painel admin → Lojas & Afiliados
2. Clique em "Configurar" na loja desejada
3. Insira seu ID de afiliado
4. Configure o tipo de link (query_param ou custom)
5. Salve as alterações

Os links de todos os produtos dessa loja serão atualizados automaticamente!

## 📊 Como Funciona o Deal Score

O Deal Score (0-100) é calculado baseado em:

1. **Desconto vs Média Histórica** (+/- 30 pontos)
2. **Proximidade do Menor Preço** (+20 pontos se for o menor)
3. **Detecção de Manipulação** (-25 pontos se detectada)
4. **Preço Original Realista** (-15 pontos se inflacionado)
5. **Tendência Recente** (+/- 5 pontos)

### Classificação

| Score | Classificação | Descrição |
|-------|---------------|-----------|
| 80-100 | Excelente | Promoção real com ótimo desconto |
| 60-79 | Bom negócio | Desconto verificado |
| 40-59 | Razoável | Desconto modesto |
| 20-39 | Duvidoso | Verifique o histórico |
| 0-19 | Evite | Preço acima da média |

## 🚧 Roadmap

- [ ] Scraping automático de preços
- [ ] Notificações por email/push
- [ ] API pública
- [ ] App mobile
- [ ] Comparador de preços
- [ ] Integração com mais lojas

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

Feito com ❤️ e ☕
