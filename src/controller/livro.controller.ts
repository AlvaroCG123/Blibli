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

  // RECURSO ADICIONAL #3 (Limite de 5 exclusões diárias) + LOGS + SOFT DELETE
  async delete(req: any, res: Response): Promise<Response> {
    const { id } = req.params;
    const usuarioLogadoId = req.usuarioId; // ID injetado pelo Middleware de JWT

    try {
      // 1. Verifica quantas exclusões este utilizador já fez hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const exclusoesHoje = await prisma.log.count({
        where: {
          usuarioId: usuarioLogadoId,
          acao: 'EXCLUSAO_LIVRO',
          data: { gte: hoje }
        }
      });

      // Bloqueia se já tiver 5 ou mais
      if (exclusoesHoje >= 5) {
        await prisma.log.create({ data: { usuarioId: usuarioLogadoId, acao: 'TENTATIVA_EXCLUSAO_BLOQUEADA' } });
        return res.status(403).json({ error: 'Anomalia detectada: Limite de 5 exclusões diárias atingido!' });
      }

      // 2. Faz o Soft Delete do Livro
      await prisma.livro.update({
        where: { id: Number(id) },
        data: { deleted: true, deletedAt: new Date() }
      });

      // 3. Regista o Log de Sucesso
      await prisma.log.create({ data: { usuarioId: usuarioLogadoId, acao: 'EXCLUSAO_LIVRO' } });

      return res.json({ message: 'Livro removido do sistema (Soft Delete).' });
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao apagar livro.' });
    }
  }

  
}