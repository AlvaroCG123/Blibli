import path from 'path';
import dotenv from 'dotenv';
import { prisma } from '../lib/prisma';

// Garante o carregamento correto das credenciais do MariaDB antes de invocar o prisma
dotenv.config({ path: path.resolve(process.cwd(), '.env') });



async function main() {
  console.log('Iniciando o seed da Biblioteca (MariaDB/MySQL)...');

  // Limpa dados anteriores
  await prisma.emprestimo.deleteMany();
  await prisma.deposito.deleteMany();
  await prisma.livro.deleteMany();
  await prisma.aluno.deleteMany();


  const aluno1 = await prisma.aluno.create({
    data: { nome: 'Elenice', email: 'lelee@gmail.com', saldo_credit: 30.00 }
  });

  const aluno2 = await prisma.aluno.create({
    data: { nome: 'Giuli', email: 'giuli@gmail.com', saldo_credit: 15.00 }
  });

  // Inserindo Livros
  const livro1 = await prisma.livro.create({
    data: { titulo: 'Clean Code', autor: 'Robert C. Martin', quant: 10, preco_multa: 5.00 }
  });

  const livro2 = await prisma.livro.create({
    data: { titulo: 'TypeScript Essentials', autor: 'Alex Turner', quant: 5, preco_multa: 3.50 }
  });

  // Criando um depósito inicial de saldo
  await prisma.deposito.create({
    data: { alunoId: aluno1.id, tipo: 'PIX', valor: 20.00 }
  });

  // Criando um empréstimo inicial
  await prisma.emprestimo.create({
    data: { alunoId: aluno1.id, livroId: livro1.id, quant: 1 }
  });

  console.log('Seed da Biblioteca executado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });