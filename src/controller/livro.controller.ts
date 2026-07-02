import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class LivroController {
  async create(req: Request, res: Response): Promise<Response> {
    const { titulo, autor, nome, quant, preco, preco_multa } = req.body;
    try {
      const livro = await prisma.livro.create({
        data: {
          titulo: titulo || nome,
          autor: autor || 'Desconhecido',
          quant: quant || 1,
          preco_multa: preco_multa ?? preco ?? 0.0
        }
      });
      return res.status(201).json(livro);
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao cadastrar livro.' });
    }
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      // Retorna apenas livros que não foram deletados
      const livros = await prisma.livro.findMany({
        where: { deleted: false }
      });
      return res.json(livros);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar livros.' });
    }
  }

  // RECURSO ADICIONAL #7: Soft Delete
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      await prisma.livro.update({
        where: { id: Number(id) },
        data: { deleted: true, deletedAt: new Date() }
      });
      return res.json({ message: 'Livro removido do sistema (Soft Delete).' });
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao apagar livro.' });
    }
  }
}