import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();

usuarioRoutes.post('/usuarios', usuarioController.create);
usuarioRoutes.get('/usuarios', usuarioController.list); // Listagem
usuarioRoutes.post('/login', usuarioController.login);

// Rotas de Recuperação de Senha
usuarioRoutes.post('/recuperar-senha', usuarioController.solicitarRecuperacao);
usuarioRoutes.post('/alterar-senha', usuarioController.alterarSenha);

export { usuarioRoutes };