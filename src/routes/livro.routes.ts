import { Router } from 'express';
import { LivroController } from '../controller/livro.controller';
import { verificarToken } from '../middleware/auth.middleware';

const livroRoutes = Router();
const livroController = new LivroController();

// Listagem é pública
livroRoutes.get('/livros', livroController.list);

// Inclusão e Exclusão (Soft Delete) são protegidas pelo Token JWT
livroRoutes.post('/livros', verificarToken, livroController.create);
livroRoutes.delete('/livros/:id', verificarToken, livroController.delete);

export { livroRoutes };