import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UsuarioController {
  async create(req: Request, res: Response): Promise<Response> {
    const { nome, email, senha } = req.body;

    try {
      // 1. Validar a complexidade da senha (mínimo 8 chars, maiúscula, minúscula, número e símbolo)
      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!senhaRegex.test(senha)) {
        return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres, letras maiúsculas, minúsculas, números e símbolos.' });
      }

      // 2. Verificar se o e-mail já existe
      const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      // 3. Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      // 4. Salvar na base de dados
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaCriptografada,
          status: 'INATIVO' 
        }
      });

      const { senha: _, ...usuarioRetorno } = novoUsuario;
      return res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: usuarioRetorno });
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao cadastrar usuário.' });
    }
  }

  // ROTA DE LOGIN COM GERAÇÃO DE TOKEN
  async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    try {
      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      // Verifica se a senha está correta
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        // Futuro: Adicionar lógica do Recurso #3 (bloqueio por tentativas inválidas) aqui
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      // Gera o Token JWT
      const secret = process.env.JWT_SECRET || 'chave_super_secreta_padrao';
      const token = jwt.sign({ id: usuario.id, email: usuario.email }, secret, {
        expiresIn: '1d' // Token expira em 1 dia
      });

      return res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor ao fazer login.' });
    }
  }
}