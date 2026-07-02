import { Router } from 'express';
import { EmprestimoController } from '../controller/emprestimo.controller';
import { verificarToken } from '../middleware/auth.middleware';

const emprestimoRoutes = Router();
const emprestimoController = new EmprestimoController();

// Apenas usuários logados podem ver, criar ou deletar (devolver) empréstimos
emprestimoRoutes.get('/emprestimos', verificarToken, emprestimoController.list);
emprestimoRoutes.post('/emprestimos', verificarToken, emprestimoController.create);
emprestimoRoutes.delete('/emprestimos/:id', verificarToken, emprestimoController.delete);

export { emprestimoRoutes };