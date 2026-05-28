import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { IDepositoInput } from '../interface/deposito.interface';

export class DepositoController {
  async create(req: Request, res: Response): Promise<Response> {
    const { alunoId, tipo, valor }: IDepositoInput = req.body;

    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const aluno = await tx.aluno.findUnique({ where: { id: alunoId } });
        if (!aluno) throw new Error('Aluno não encontrado.');

        await tx.aluno.update({
          where: { id: alunoId },
          data: { saldo_credit: aluno.saldo_credit + valor }
        });

        const novoDeposito = await tx.deposito.create({
          data: { alunoId, tipo, valor }
        });

        return novoDeposito;
      });

      return res.status(201).json({ message: 'Depósito efetuado!', resultado });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      const depositos = await prisma.deposito.findMany({ include: { aluno: true } });
      return res.json(depositos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar depósitos.' });
    }
  }
}
