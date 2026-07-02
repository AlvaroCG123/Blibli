import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export class UsuarioController {
  // 1. INCLUSÃO DE UTILIZADOR
  async create(req: Request, res: Response): Promise<Response> {
    const { nome, email, senha } = req.body;
    try {
      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!senhaRegex.test(senha)) {
        return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres, maiúsculas, minúsculas, números e símbolos.' });
      }

      const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
      if (usuarioExistente) return res.status(400).json({ error: 'Este e-mail já está em uso.' });

      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      const novoUsuario = await prisma.usuario.create({
        data: { nome, email, senha: senhaCriptografada, status: 'ATIVO' }
      });

      const { senha: _, ...usuarioRetorno } = novoUsuario;
      return res.status(201).json({ message: 'Usuário criado com sucesso!', usuario: usuarioRetorno });
    } catch (error: any) {
      return res.status(400).json({ error: 'Erro ao cadastrar usuário.' });
    }
  }

  // REQUISITO OBRIGATÓRIO: LISTAGEM DE UTILIZADORES
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, status: true, tentativasInvalidas: true }
      });
      return res.json(usuarios);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar utilizadores.' });
    }
  }

  // LOGIN + LOGS + RECURSO ADICIONAL #2 (Bloqueio)
  async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

      // Verifica se está bloqueado
      if (usuario.status === 'BLOQUEADO') {
        await prisma.log.create({ data: { usuarioId: usuario.id, acao: 'TENTATIVA_ACESSO_BLOQUEADO' } });
        return res.status(401).json({ error: 'Conta bloqueada por excesso de tentativas.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      
      // Lógica de Falha e Bloqueio
      if (!senhaValida) {
        const tentativas = usuario.tentativasInvalidas + 1;
        if (tentativas >= 3) {
          await prisma.usuario.update({ where: { id: usuario.id }, data: { tentativasInvalidas: tentativas, status: 'BLOQUEADO' } });
          await prisma.log.create({ data: { usuarioId: usuario.id, acao: 'BLOQUEIO_DE_CONTA' } });
          return res.status(401).json({ error: 'Conta bloqueada após 3 tentativas inválidas.' });
        }
        await prisma.usuario.update({ where: { id: usuario.id }, data: { tentativasInvalidas: tentativas } });
        await prisma.log.create({ data: { usuarioId: usuario.id, acao: 'FALHA_DE_LOGIN' } });
        return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      }

      // Sucesso no Login
      await prisma.usuario.update({ where: { id: usuario.id }, data: { tentativasInvalidas: 0 } });
      await prisma.log.create({ data: { usuarioId: usuario.id, acao: 'LOGIN_SUCESSO' } });

      const secret = process.env.JWT_SECRET || 'chave_super_secreta_padrao';
      const token = jwt.sign({ id: usuario.id, email: usuario.email }, secret, { expiresIn: '1d' });

      return res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
      return res.status(500).json({ error: 'Erro no servidor.' });
    }
  }

  // REQUISITO OBRIGATÓRIO: RECUPERAÇÃO DE PALAVRA-PASSE
  async solicitarRecuperacao(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario) return res.status(404).json({ error: 'Utilizador não encontrado.' });

      // Gera um token aleatório simples de 6 dígitos (ex: 123456)
      const tokenRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();
      
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { tokenValidacao: tokenRecuperacao }
      });

      // Configuração do Nodemailer com Mailtrap para testes
      const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io", // O host pode ser diferente dependendo da tua conta, confirma no Mailtrap
        port: 2525, // Porta padrão do Mailtrap
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      });

      const mailOptions = {
        from: '"Biblioteca Senac" <nao-responder@biblioteca.senac.br>', // Podes inventar qualquer e-mail emissor no Mailtrap
        to: email,
        subject: 'Recuperação de Palavra-passe',
        text: `Olá ${usuario.nome},\n\nO teu código de recuperação é: ${tokenRecuperacao}\n\nSe não solicitaste esta alteração, podes ignorar esta mensagem.`
      };

      // Dispara o e-mail
      await transporter.sendMail(mailOptions);

      return res.json({ message: 'Se o e-mail existir no sistema, um código de recuperação foi enviado.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao solicitar recuperação de palavra-passe.' });
    }
  }

  async alterarSenha(req: Request, res: Response): Promise<Response> {
    const { email, codigo, novaSenha } = req.body;
    try {
      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario || usuario.tokenValidacao !== codigo) {
        return res.status(400).json({ error: 'Código inválido ou expirado.' });
      }

      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(novaSenha, salt);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { senha: senhaCriptografada, tokenValidacao: null, tentativasInvalidas: 0, status: 'ATIVO' }
      });

      await prisma.log.create({ data: { usuarioId: usuario.id, acao: 'SENHA_ALTERADA' } });

      return res.json({ message: 'Palavra-passe alterada com sucesso!' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao alterar palavra-passe.' });
    }
  }
}