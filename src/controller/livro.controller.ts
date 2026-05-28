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
      const livros = await prisma.livro.findMany();
      return res.json(livros);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar livros.' });
    }
  }
}
