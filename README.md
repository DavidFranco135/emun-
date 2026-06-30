# Emuná — Sistema completo de e-commerce

Loja virtual completa: site público (Home, catálogo com filtros, página de
produto, carrinho, checkout) + **painel administrativo completo** (dashboard,
produtos, categorias, pedidos, financeiro, relatórios, configurações).
Tudo em HTML/CSS/JS puro (ES Modules), integrado ao **Firebase**
(Firestore + Authentication).

## Como rodar

```bash
npx serve .
# ou
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Não funciona em `file://` por causa dos
módulos ES e dos `fetch()` dos partials.

**Sem configurar o Firebase, o sistema inteiro já funciona com dados de
demonstração** — loja e painel administrativo incluídos. Isso permite ver e
testar tudo (inclusive cadastrar produtos, mudar status de pedidos, etc.)
antes de conectar um projeto Firebase real. Em modo demonstração, as
alterações feitas no painel ficam só na sessão atual (somem ao recarregar a
página) — é só para explorar a interface.

## Conectando ao seu Firebase

1. Crie um projeto em https://console.firebase.google.com.
2. Ative em **Build**: **Authentication** (método e-mail/senha),
   **Firestore Database** (modo produção) e **Storage**.
3. Em **Configurações do projeto → Geral → Seus apps**, crie um app Web e
   copie as credenciais para `js/firebase-config.js`.
4. Crie um usuário administrador em **Authentication → Users** — é esse
   e-mail/senha que dá acesso ao painel.
5. Configure as regras de segurança do Firestore (veja seção abaixo).

## Como acessar o painel administrativo

Na Home pública, o botão de acesso é **discreto de propósito**: um pontinho
quase invisível no canto do rodapé (ao lado do "© Emuná"). Também é possível
abrir o login com o atalho **`Ctrl+Alt+E`** em qualquer página pública. Após
o login, você é levado para `admin/index.html`.

> Se você acessar `admin/index.html` diretamente sem estar logado (e o
> Firebase estiver configurado), é redirecionado de volta para a loja.

## Estrutura do projeto

```
emuna/
├── index.html                 Home pública
├── loja.html                  Catálogo com filtros (categoria, preço, estoque, promoção, busca)
├── produto.html                Página de produto (galeria, avaliações, relacionados)
├── cart.html                   Carrinho (cupom, frete estimado, resumo)
├── checkout.html                Finalização de compra
├── politica-privacidade.html / trocas.html / termos.html
├── manifest.json                Manifesto do PWA
│
├── partials/                    Header e footer reutilizados em toda a loja pública
│   ├── header.html
│   └── footer.html
│
├── css/
│   ├── styles.css                Design system da loja (tokens, componentes)
│   └── loja.css / product.css / cart.css / checkout.css / legal.css
│
├── js/
│   ├── firebase-config.js        Credenciais do Firebase (preencher)
│   ├── firestore-service.js      TODA leitura/escrita no Firestore, com fallback de demonstração
│   ├── demo-data.js              Dados de demonstração (produtos, categorias, pedidos, etc.)
│   ├── cart.js                   Estado do carrinho (localStorage)
│   ├── favorites.js              Estado de favoritos (localStorage)
│   ├── layout.js                 Carrega header/footer + interações comuns da loja pública
│   ├── admin-access.js           Login administrativo discreto (modal)
│   ├── product-card.js           Componente reutilizável de card de produto
│   └── home.js / loja.js / product.js / cart-page.js / checkout.js / legal.js
│
└── admin/                         PAINEL ADMINISTRATIVO
    ├── index.html                  Dashboard (indicadores + gráficos)
    ├── produtos.html                Gestão de produtos (CRUD completo)
    ├── categorias.html              Gestão de categorias (CRUD completo)
    ├── pedidos.html                  Gestão de pedidos (status, rastreio, impressão)
    ├── financeiro.html               Entradas, saídas, lucro, contas a receber, exportação
    ├── relatorios.html                Relatórios exportáveis (CSV/PDF)
    ├── configuracoes.html             Identidade da loja, redes sociais, SEO, integrações
    ├── partials/sidebar.html          Menu lateral + barra superior do painel
    ├── css/admin.css                  Design system do painel
    └── js/
        ├── admin-auth-guard.js        Protege todas as páginas do painel
        ├── admin-layout.js             Carrega sidebar + liga o guard
        ├── admin-toast.js              Notificações
        └── admin-dashboard.js / admin-products.js / admin-categories.js /
            admin-orders.js / admin-financeiro.js / admin-reports.js / admin-settings.js
```

## Estrutura de coleções no Firestore

| Coleção | Campos principais |
|---|---|
| `banners` | title, subtitle, image, ctaLabel, ctaLink, active, order |
| `promoBanners` | title, image, link, order |
| `categories` | name, icon, image, order, parentId (opcional) |
| `products` | name, shortDescription, description, price, promoPrice, images[], video, categoryId, sku, stock, weight, dimensions, featured, bestSeller, isNew, active, rating, reviews[] |
| `orders` | id, customerName, customerEmail, items[], total, status (`pendente`/`pago`/`enviado`/`cancelado`), payment, trackingCode, createdAt |
| `transactions` | description, category, amount, date, type (`saida`) |
| `coupons` | code, type (`percent`/`shipping`), value, label |
| `testimonials` | name, text, rating |
| `settings` (doc único `store`) | storeName, email, phone, whatsapp, address, logo, favicon, instagram, facebook, seoTitle, seoDescription, googleAnalytics, googleTagManager, metaPixel |

Enquanto qualquer coleção estiver vazia/inacessível, tanto a loja quanto o
painel usam automaticamente o conteúdo de `js/demo-data.js` — nada aparece
quebrado ou vazio, mesmo antes de você povoar o banco.

## Regras de segurança sugeridas (Firestore)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

> Em produção, recomenda-se restringir ainda mais a escrita (ex.: checar um
> campo `role: "admin"` em `/admins/{uid}`), mas isso já garante que só
> usuários autenticados (ou seja, você) podem alterar dados.

## O que já está pronto

- **Loja pública**: Home, catálogo com filtros, produto, carrinho, checkout,
  páginas institucionais — tudo responsivo, com identidade visual completa.
- **Painel administrativo completo**: dashboard com gráficos, CRUD de
  produtos e categorias, gestão de pedidos (status/rastreio/impressão),
  financeiro (entradas/saídas/lucro/contas a receber com filtro de período e
  exportação), relatórios exportáveis e configurações da loja.
- **Modo demonstração**: o sistema inteiro funciona sem Firebase configurado.

## Próximos passos possíveis

- Autenticação de **clientes** (login/cadastro, histórico de pedidos, área "minha conta")
- Gestão de **clientes** no painel (bloquear, observações, endereços salvos)
- Integração de pagamento real (Pix/cartão/boleto) no checkout
- Upload de imagens via Firebase Storage (hoje as imagens são por URL)
- Service worker para funcionamento offline real do PWA
- Cálculo de frete real via API dos Correios/transportadora

## Identidade visual aplicada

- **Cor:** violeta `#6F3CC3` / `#4A1F8C`, creme `#FAF7FB`, lilás `#EDE3F7`, dourado discreto `#B89860`
- **Tipografia:** Fraunces (títulos) + Outfit (corpo/UI)
- **Assinatura:** o "fio" — uma linha de ponto de corrente em SVG, usada como divisor de seções e moldura de depoimentos, remetendo ao crochê
- **Painel admin:** mesma paleta, layout de sidebar fixa + topbar, gráficos com Chart.js
