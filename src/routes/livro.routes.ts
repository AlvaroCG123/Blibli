import { Router } from 'express';
import { LivroController } from '../controller/livro.controller';

const livroRoutes = Router();
const livroController = new LivroController();

livroRoutes.post('/livros', livroController.create);
livroRoutes.get('/livros', livroController.list);

export { livroRoutes };
