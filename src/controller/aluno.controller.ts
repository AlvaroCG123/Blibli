import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class AlunoController {
  async create(req: Request, res: Response): Promise<Response> {
    const { nome, email, saldo_credit } = req.body;
    try {
      const aluno = await prisma.aluno.create({
        data: { nome, email, saldo_credit: saldo_credit || 0 }
      });
      return res.status(201).json(aluno);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao cadastrar aluno. Verifique se o e-mail já existe.' });
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      // Retorna apenas alunos que não foram deletados
      const alunos = await prisma.aluno.findMany({
        where: { deleted: false }
      });
      return res.json(alunos);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
  }

  // RECURSO ADICIONAL #7: Soft Delete
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      await prisma.aluno.update({
        where: { id: Number(id) },
        data: { deleted: true, deletedAt: new Date() }
      });
      return res.json({ message: 'Aluno removido do sistema (Soft Delete).' });
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao apagar aluno.' });
    }
  }
}