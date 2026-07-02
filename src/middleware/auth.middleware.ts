import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estende o tipo Request do Express para incluir o id do usuario logado
export interface AuthRequest extends Request {
  usuarioId?: number;
}

export function verificarToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'chave_super_secreta_padrao';
    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    
    // Anexa o ID do usuário na requisição para ser usado nos controllers
    req.usuarioId = decoded.id;
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}