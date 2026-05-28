import express from 'express';
import { alunoRoutes } from './routes/aluno.routes';
import { livroRoutes } from './routes/livro.routes';
import { depositoRoutes } from './routes/deposito.routes';
import { emprestimoRoutes } from './routes/emprestimo.routes';

const app = express();

app.use(express.json());

app.use(alunoRoutes);
app.use(livroRoutes);
app.use(depositoRoutes);
app.use(emprestimoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor da Biblioteca rodando perfeitamente na porta ${PORT}`);
});