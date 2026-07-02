import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { IEmprestimoInput } from '../interface/emprestimo.interface';
import { Prisma } from '@prisma/client/extension';

export class EmprestimoController {
  
  // ITEM 3 DO TRABALHO: Inclusão de dados com TRANSAÇÃO
  async create(req: Request, res: Response): Promise<Response> {
    const { alunoId, livroId, quant }: IEmprestimoInput = req.body;

    try {
      const livroIdCorreto = livroId || (req.body as any).livroId;

      // 2. Adicione a tipagem no tx aqui:
      const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const livro = await tx.livro.findUnique({ where: { id: livroIdCorreto } });
        if (!livro || livro.quant < quant) {
          throw new Error('Livro indisponível no acervo ou estoque insuficiente.');
        }

        const aluno = await tx.aluno.findUnique({ where: { id: alunoId } });
        if (!aluno) throw new Error('Aluno não encontrado.');

        const taxaSeguro = 2.0 * quant;
        if (aluno.saldo_credit < taxaSeguro) {
          throw new Error('Saldo insuficiente para cobrir a taxa de segurança do empréstimo.');
        }

        await tx.livro.update({
          where: { id: livroIdCorreto },
          data: { quant: livro.quant - quant }
        });

        await tx.aluno.update({
          where: { id: alunoId },
          data: { saldo_credit: aluno.saldo_credit - taxaSeguro }
        });

        const novoEmprestimo = await tx.emprestimo.create({
          data: { alunoId, livroId: livroIdCorreto, quant }
        });

        return novoEmprestimo;
      });

      return res.status(201).json({ message: 'Empréstimo registrado com sucesso!', resultado });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      const emprestimos = await prisma.emprestimo.findMany({
        include: { aluno: true, livro: true }
      });
      return res.json(emprestimos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar empréstimos.' });
    }
  }

  // ITEM 4 DO TRABALHO: Exclusão de registro com TRANSAÇÃO (Devolução do livro)
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      // 3. Adicione a tipagem no tx aqui também:
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const emprestimo = await tx.emprestimo.findUnique({ where: { id: Number(id) } });
        if (!emprestimo) throw new Error('Registro de empréstimo não encontrado.');

        // 1. Devolve os livros para a estante (Incrementa estoque)
        await tx.livro.update({
          where: { id: emprestimo.livroId },
          data: { quant: { increment: emprestimo.quant } }
        });

        // 2. Estorna a taxa de segurança para o aluno
        const taxaEstorno = 2.00 * emprestimo.quant;
        await tx.aluno.update({
          where: { id: emprestimo.alunoId },
          data: { saldo_credit: { increment: taxaEstorno } }
        });

        // 3. Remove o empréstimo do sistema ativo
        await tx.emprestimo.delete({ where: { id: Number(id) } });
      });

      return res.json({ message: 'Livro devolvido e taxas estornadas com sucesso!' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}