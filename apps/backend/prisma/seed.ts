import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function main() {
  console.log('--- INICIANDO SEED VANTAGE PREMIUM ---');

  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('--- LIMPANDO DADOS EXISTENTES ---');
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.stock.deleteMany({});
    await prisma.productImages.deleteMany({});
    await prisma.product.deleteMany({});

    // 1. CATEGORIES
    const categoriesData = [
      { name: 'Casual', slug: 'casual', description: 'Mochilas para o dia a dia' },
      { name: 'Escolar', slug: 'escolar', description: 'Ideal para estudantes' },
      { name: 'Executivo', slug: 'executivo', description: 'Visual profissional e elegante' },
      { name: 'Esportivo', slug: 'esportivo', description: 'Leveza e resistência para treinos' }
    ];

    const categories: any = {};
    for (const cat of categoriesData) {
      categories[cat.slug] = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: cat,
      });
    }

    // 2. PRODUCTS (Removed to allow manual entry)
    console.log('ℹ️ Catálogo de produtos ignorado para permitir cadastro manual.');

    // 3. RULES & PROFILES (Preserving previous configuration)
    const rulesData = [
      { name: 'Visualizar Produtos', slug: 'product:view', description: 'Permite visualizar produtos' },
      { name: 'Criar Produtos', slug: 'product:create', description: 'Permite criar novos produtos' },
      { name: 'Editar Produtos', slug: 'product:update', description: 'Permite editar produtos existentes' },
      { name: 'Deletar Produtos', slug: 'product:delete', description: 'Permite deletar produtos' },
      { name: 'Visualizar Estoque', slug: 'stock:view', description: 'Permite visualizar estoque' },
      { name: 'Gerenciar Estoque', slug: 'stock:manage', description: 'Permite gerenciar estoque' },
      { name: 'Gerenciar Carrinho', slug: 'cart:manage', description: 'Permite gerenciar o carrinho' },
      { name: 'Visualizar Pedidos', slug: 'order:view', description: 'Permite visualizar pedidos' },
      { name: 'Gerenciar Pedidos', slug: 'order:manage', description: 'Permite gerenciar pedidos' },
      { name: 'Gerenciar Endereços', slug: 'address:manage', description: 'Permite gerenciar endereços' },
      { name: 'Visualizar Usuários', slug: 'user:view', description: 'Permite visualizar usuários' },
      { name: 'Gerenciar Usuários', slug: 'user:manage', description: 'Permite gerenciar usuários' },
      { name: 'Visualizar Perfis', slug: 'profile:view', description: 'Permite visualizar perfis' },
      { name: 'Criar Perfis', slug: 'profile:create', description: 'Permite criar perfis' },
      { name: 'Editar Perfis', slug: 'profile:update', description: 'Permite editar perfis' },
      { name: 'Deletar Perfis', slug: 'profile:delete', description: 'Permite deletar perfis' },
      { name: 'Visualizar Pagamentos', slug: 'payment:view', description: 'Permite visualizar pagamentos' },
      { name: 'Gerenciar Pagamentos', slug: 'payment:manage', description: 'Permite gerenciar pagamentos' },
      { name: 'Gerenciar Webhooks', slug: 'webhook:manage', description: 'Permite gerenciar webhooks' },
      { name: 'Visualizar Categorias', slug: 'category:view', description: 'Permite visualizar categorias' },
      { name: 'Criar Categorias', slug: 'category:create', description: 'Permite criar categorias' },
      { name: 'Editar Categorias', slug: 'category:update', description: 'Permite editar categorias' },
      { name: 'Deletar Categorias', slug: 'category:delete', description: 'Permite deletar categorias' },
      { name: 'Visualizar Dashboard', slug: 'dashboard:view', description: 'Permite acessar o dashboard' },
      { name: 'Visualizar Relatórios', slug: 'report:view', description: 'Permite visualizar relatórios' },
      { name: 'Gerenciar Configurações', slug: 'settings:manage', description: 'Permite gerenciar configurações' },
      { name: 'Gerenciar Trocas', slug: 'exchange:manage', description: 'Permite gerenciar solicitações de troca e devolução' },
      { name: 'Moderenciar Avaliações', slug: 'review:manage', description: 'Permite moderar e excluir avaliações de produtos' }
    ];

    for (const rule of rulesData) {
      await prisma.rule.upsert({
        where: { slug: rule.slug },
        update: { name: rule.name, description: rule.description },
        create: rule,
      });
    }

    const allRules = await prisma.rule.findMany();
    const owner = await prisma.accessProfile.upsert({
      where: { name: 'OWNER' },
      update: {},
      create: { name: 'OWNER', description: 'Dono do sistema' }
    });
    await prisma.accessProfile.update({
      where: { id: owner.id },
      data: { rules: { set: allRules.map(r => ({ id: r.id })) } }
    });

    // 3.5 CUSTOMER PROFILE
    const customerRules = allRules.filter(r =>
      ['product:view', 'cart:manage', 'order:view', 'address:manage', 'payment:view', 'category:view', 'dashboard:view'].includes(r.slug)
    );
    const customer = await prisma.accessProfile.upsert({
      where: { name: 'CUSTOMER' },
      update: {},
      create: { name: 'CUSTOMER', description: 'Perfil de cliente final' }
    });
    await prisma.accessProfile.update({
      where: { id: customer.id },
      data: { rules: { set: customerRules.map(r => ({ id: r.id })) } }
    });

    // 4. ADMIN USER
    await prisma.user.deleteMany({
      where: { email: 'admin@vantage.com' }
    });
    const hashedPassword = await bcrypt.hash('senha123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@vantage.com',
        name: 'Admin Principal',
        cpf: '99999999999',
        password: hashedPassword,
        isActive: true,
      }
    });
    await prisma.userProfile.create({
      data: { userId: admin.id, accessProfileId: owner.id }
    });

  } catch (err: any) {
    console.error('❌ Erro no seed:', err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
