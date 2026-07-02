# 📚 Documentação da API - Biblioteca (Trabalho #2 Segurança)

Este projeto implementa uma API para a gestão de uma Biblioteca com um robusto sistema de segurança, incluindo autenticação via Token JWT, proteção contra ataques de força bruta, deteção de anomalias diárias e *Soft Delete*.

## 🚀 Como testar (Postman / Insomnia)

Para as rotas que estão protegidas com o selo **[🔒 Requer Token]**, precisas primeiro de fazer **Login**, copiar o token devolvido e colar na aba **Authorization** -> **Bearer Token** do Postman/Insomnia.

---

### 1. 🛡️ Segurança e Autenticação (Usuários)

#### Inclusão de Usuário
- **Método:** `POST`
- **Rota:** `/usuarios`
- **Regras:** A senha deve conter 8 caracteres, maiúscula, minúscula, número e símbolo.
- **JSON:**
```json
{
  "nome": "Giuli Pereira",
  "email": "giuli@senac.br",
  "senha": "password@2026"
}

Listar Usuários
Método: GET

Rota: /usuarios

Nenhum Body necessário.

Login (Geração de Token JWT)
Método: POST

Rota: /login

Regra: Se errares a senha 3x, a conta será bloqueada.

JSON:

JSON
{
  "email": "admin@senac.br",
  "senha": "Senha@123"
}

Solicitar Recuperação de Senha
Método: POST

Rota: /recuperar-senha

JSON:

JSON
{
  "email": "admin@senac.br"
}

Alterar Senha (com o código recebido)
Método: POST

Rota: /alterar-senha

JSON:

JSON
{
  "email": "admin@senac.br",
  "codigo": "COLOQUE_O_CODIGO_RECEBIDO_NO_CONSOLE_AQUI",
  "novaSenha": "NovaSenha@2026"
}

2. 📖 Gestão de Livros
Cadastrar Livro [🔒 Requer Token]
Método: POST

Rota: /livros

JSON:

JSON
{
  "titulo": "Arquitetura Limpa",
  "autor": "Robert C. Martin",
  "quant": 5,
  "preco_multa": 4.50
}

Listar Livros
Método: GET

Rota: /livros

Excluir Livro (Soft Delete) [🔒 Requer Token]
Método: DELETE

Rota: /livros/1 (Substitua 1 pelo ID do livro)

Regra (Anomalia): O utilizador autenticado não pode excluir mais de 5 livros no mesmo dia.

3. 🎓 Gestão de Alunos
Cadastrar Aluno [🔒 Requer Token]
Método: POST

Rota: /alunos

JSON:

JSON
{
  "nome": "João Silva",
  "email": "joao.silva@teste.com",
  "saldo_credit": 50.00
}

Listar Alunos
Método: GET

Rota: /alunos

Excluir Aluno (Soft Delete) [🔒 Requer Token]
Método: DELETE

Rota: /alunos/1 (Substitua 1 pelo ID do aluno)

4. 🔄 Empréstimos e Depósitos
Realizar Depósito (Adicionar saldo) [🔒 Requer Token]
Método: POST

Rota: /depositos

JSON:

JSON
{
  "alunoId": 1,
  "tipo": "PIX",
  "valor": 15.50
}

Listar Depósitos
Método: GET

Rota: /depositos

Registrar Empréstimo [🔒 Requer Token]
Método: POST

Rota: /emprestimos

Regra: Consome 2.0 * quant de crédito do aluno.

JSON:

JSON
{
  "alunoId": 1,
  "livroId": 1,
  "quant": 1
}

Listar Empréstimos [🔒 Requer Token]
Método: GET

Rota: /emprestimos

Devolver Livro (Excluir Empréstimo) [🔒 Requer Token]
Método: DELETE

Rota: /emprestimos/1 (Substitua 1 pelo ID do empréstimo)