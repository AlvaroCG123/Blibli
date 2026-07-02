import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Iniciando o seed da Biblioteca (MariaDB/MySQL)...');

  // Limpa dados anteriores na ordem correta para não quebrar as Foreign Keys
  await prisma.log.deleteMany();
  await prisma.emprestimo.deleteMany();
  await prisma.deposito.deleteMany();
  await prisma.livro.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. Criando um Usuário Administrador (Bibliotecário) para testes de Login
  const salt = await bcrypt.genSalt(10);
  const senhaCriptografada = await bcrypt.hash('Senha@123', salt);

  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador (Professor Edécio)',
      email: 'admin@senac.br',
      senha: senhaCriptografada,
      status: 'ATIVO'
    }
  });

  // 2. Criando Alunos
  const aluno1 = await prisma.aluno.create({
    data: { nome: 'Elenice', email: 'lelee@gmail.com', saldo_credit: 30.00 }
  });

  const aluno2 = await prisma.aluno.create({
    data: { nome: 'Giuli', email: 'giuli@gmail.com', saldo_credit: 15.00 }
  });

  // 3. Inserindo Livros
  const livro1 = await prisma.livro.create({
    data: { titulo: 'Clean Code', autor: 'Robert C. Martin', quant: 10, preco_multa: 5.00 }
  });

  const livro2 = await prisma.livro.create({
    data: { titulo: 'TypeScript Essentials', autor: 'Alex Turner', quant: 5, preco_multa: 3.50 }
  });

  // 4. Criando um depósito inicial de saldo
  await prisma.deposito.create({
    data: { alunoId: aluno1.id, tipo: 'PIX', valor: 20.00 }
  });

  // 5. Criando um empréstimo inicial vinculado ao administrador
  await prisma.emprestimo.create({
    data: { alunoId: aluno1.id, livroId: livro1.id, quant: 1, usuarioId: admin.id }
  });

  console.log('✅ Seed da Biblioteca executado com sucesso!');
  console.log('\n--- CREDENCIAIS PARA TESTE DE LOGIN ---');
  console.log('E-mail: admin@senac.br');
  console.log('Senha:  Senha@123');
  console.log('---------------------------------------');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });