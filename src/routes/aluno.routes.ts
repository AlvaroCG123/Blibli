import { Router } from 'express';
import { AlunoController } from '../controller/aluno.controller';
import { verificarToken } from '../middleware/auth.middleware';

const alunoRoutes = Router();
const alunoController = new AlunoController();

// Listagem é pública
alunoRoutes.get('/alunos', alunoController.list);

// Inclusão e Exclusão (Soft Delete) são protegidas pelo Token JWT
alunoRoutes.post('/alunos', verificarToken, alunoController.create);
alunoRoutes.delete('/alunos/:id', verificarToken, alunoController.delete);

export { alunoRoutes };