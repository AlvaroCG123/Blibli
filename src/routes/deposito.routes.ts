import { Router } from 'express';
import { DepositoController } from '../controller/deposito.controller';

const depositoRoutes = Router();
const depositoController = new DepositoController();

depositoRoutes.post('/depositos', depositoController.create);
depositoRoutes.get('/depositos', depositoController.list);

export { depositoRoutes };
