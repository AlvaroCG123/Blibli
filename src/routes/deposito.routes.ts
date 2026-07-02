import { Router } from 'express';
import { DepositoController } from '../controller/deposito.controller';
import { verificarToken } from '../middleware/auth.middleware';

const depositoRoutes = Router();
const depositoController = new DepositoController();

depositoRoutes.get('/depositos', depositoController.list);

// Apenas usuários autenticados no sistema podem registrar depósitos
depositoRoutes.post('/depositos', verificarToken, depositoController.create);

export { depositoRoutes };