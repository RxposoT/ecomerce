import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const categories = [
  { name: 'Eletrónica', slug: 'electronica', description: 'Gadgets e tecnologia', sort_order: 1 },
  { name: 'Moda', slug: 'moda', description: 'Roupa e acessórios', sort_order: 2 },
  { name: 'Casa & Jardim', slug: 'casa-jardim', description: 'Decoração e exterior', sort_order: 3 },
  { name: 'Saúde & Bem-estar', slug: 'saude-bem-estar', description: 'Cuidados pessoais', sort_order: 4 },
  { name: 'Desporto', slug: 'desporto', description: 'Equipamento desportivo', sort_order: 5 },
  { name: 'Livros & Papelaria', slug: 'livros-papelaria', description: 'Leitura e escrita', sort_order: 6 },
]

const products = [
  { name: 'Auriculares Sem Fios Pro', slug: 'auriculares-sem-fios-pro', description: 'Cancelamento de ruído ativo, 30h de bateria, som imersivo.', price: 89.99, compare_price: 129.99, category_slug: 'electronica', is_featured: true, stock_quantity: 50 },
  { name: 'Carregador Wireless Rápido', slug: 'carregador-wireless-rapido', description: 'Carregamento sem fios até 15W. Compatível com todos os dispositivos.', price: 29.99, category_slug: 'electronica', is_featured: true, stock_quantity: 100 },
  { name: 'Teclado Mecânico Compacto', slug: 'teclado-mecanico-compacto', description: 'Switches azuis, retroiluminação RGB, layout PT.', price: 59.99, compare_price: 79.99, category_slug: 'electronica', stock_quantity: 30 },
  { name: 'Mochila Executiva 15"', slug: 'mochila-executiva-15', description: 'Couro sintético, compartimento para portátil, à prova de água.', price: 69.99, category_slug: 'moda', is_featured: true, stock_quantity: 25 },
  { name: 'T-shirt Algodão Orgânico', slug: 'tshirt-algodao-organico', description: 'Algodão 100% orgânico, corte regular, pack de 3 cores.', price: 34.99, compare_price: 49.99, category_slug: 'moda', stock_quantity: 200 },
  { name: 'Sapatilhas Casuais Brancas', slug: 'sapatilhas-casuais-brancas', description: 'Design minimalista, sola confortável, pele sintética.', price: 79.99, category_slug: 'moda', is_featured: true, stock_quantity: 40 },
  { name: 'Vela Aromática Baunilha', slug: 'vela-aromatica-baunilha', description: 'Cera de soja, 200h de duração, frasco de vidro.', price: 14.99, category_slug: 'casa-jardim', stock_quantity: 60 },
  { name: 'Conjunto de Toalhas 4 peças', slug: 'conjunto-toalhas-4-pecas', description: 'Algodão egípcio 600g/m², 4 cores à escolha.', price: 44.99, compare_price: 59.99, category_slug: 'casa-jardim', is_featured: true, stock_quantity: 35 },
  { name: 'Vaso Cerâmica Médio', slug: 'vaso-ceramica-medio', description: 'Cerâmica pintada à mão, diâmetro 25cm, com furo de drenagem.', price: 24.99, category_slug: 'casa-jardim', stock_quantity: 20 },
  { name: 'Kit Skincare Essencial', slug: 'kit-skincare-essencial', description: 'Limpeza, hidratação e proteção. 3 produtos naturais.', price: 39.99, category_slug: 'saude-bem-estar', is_featured: true, stock_quantity: 45 },
  { name: 'Escova de Dentes Elétrica', slug: 'escova-dentes-eletrica', description: '3 modos de limpeza, temporizador, bateria 2 semanas.', price: 49.99, compare_price: 69.99, category_slug: 'saude-bem-estar', stock_quantity: 30 },
  { name: 'Tapete de Yoga 6mm', slug: 'tapete-yoga-6mm', description: 'PVC antiderrapante, 183x68cm, saco incluído.', price: 29.99, category_slug: 'desporto', stock_quantity: 40 },
  { name: 'Garrafa Térmica Inox 750ml', slug: 'garrafa-termica-inox-750ml', description: 'Aço inoxidável, mantém temperatura 12h, design sleek.', price: 22.99, category_slug: 'desporto', is_featured: true, stock_quantity: 80 },
  { name: 'Caderno Capa Dura A5', slug: 'caderno-capa-dura-a5', description: 'Papel reciclado 120g, 200 páginas, capa de linho.', price: 12.99, category_slug: 'livros-papelaria', stock_quantity: 150 },
  { name: 'Caneta Tinteiro Premium', slug: 'caneta-tinteiro-premium', description: 'Ponta dourada, corpo em resina, tinta azul incluída.', price: 34.99, category_slug: 'livros-papelaria', stock_quantity: 25 },
]

async function seed() {
  console.log('📦 A criar categorias...')
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .upsert(categories.map(c => ({ ...c, is_active: true })), { onConflict: 'slug' })
    .select()
  if (catErr) { console.error('Erro categorias:', catErr); return }
  console.log(`  ✅ ${cats.length} categorias criadas`)

  const slugToId = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  console.log('📦 A criar produtos...')
  const productsData = products.map(p => ({
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compare_price: p.compare_price || null,
    category_id: slugToId[p.category_slug],
    is_featured: p.is_featured || false,
    is_active: true,
    stock_quantity: p.stock_quantity,
  }))

  const { data: prods, error: prodErr } = await supabase
    .from('products')
    .upsert(productsData, { onConflict: 'slug' })
    .select()
  if (prodErr) { console.error('Erro produtos:', prodErr); return }
  console.log(`  ✅ ${prods.length} produtos criados`)

  console.log('✨ Seed concluído!')
}

seed()
