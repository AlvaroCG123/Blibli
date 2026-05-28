import { Router } from 'express';
import { AlunoController } from '../controller/aluno.controller';

const alunoRoutes = Router();
const alunoController = new AlunoController();

alunoRoutes.post('/alunos', alunoController.create);
alunoRoutes.get('/alunos', alunoController.list);

export { alunoRoutes };
