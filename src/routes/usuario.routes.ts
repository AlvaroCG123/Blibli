import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();

usuarioRoutes.post('/usuarios', usuarioController.create);
// Rota de Login (Gera o Token JWT)
usuarioRoutes.post('/login', usuarioController.login);

export { usuarioRoutes };