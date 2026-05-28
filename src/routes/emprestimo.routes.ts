import { Router } from 'express';
import { EmprestimoController } from '../controller/emprestimo.controller';

const emprestimoRoutes = Router();
const emprestimoController = new EmprestimoController();

emprestimoRoutes.post('/emprestimos', emprestimoController.create);
emprestimoRoutes.get('/emprestimos', emprestimoController.list);
emprestimoRoutes.delete('/emprestimos/:id', emprestimoController.delete);

export { emprestimoRoutes };