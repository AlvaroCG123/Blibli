# 📚 API da Biblioteca

Esta API faz a gestão de uma biblioteca com autenticação por JWT, soft delete e registo de empréstimos, depósitos e utilizadores.

## Como testar

Nas rotas marcadas com **[🔒 Requer Token]**, faz login primeiro, copia o token e envia no header:

```text
Authorization: Bearer SEU_TOKEN_AQUI
```

## Rotas de Usuários

### Criar usuário
- **Método:** `POST`
- **Rota:** `/usuarios`
- **Autenticação:** pública

Exemplo de JSON:
```json
{
  "nome": "Giuli Pereira",
  "email": "giuli@senac.br",
  "senha": "password@2026"
}
```

### Listar usuários
- **Método:** `GET`
- **Rota:** `/usuarios`
- **Autenticação:** pública

Sem body.

### Login
- **Método:** `POST`
- **Rota:** `/login`
- **Autenticação:** pública

Exemplo de JSON:
```json
{
  "email": "admin@senac.br",
  "senha": "Senha@123"
}
```

### Solicitar recuperação de senha
- **Método:** `POST`
- **Rota:** `/recuperar-senha`
- **Autenticação:** pública

Exemplo de JSON:
```json
{
  "email": "admin@senac.br"
}
```

### Alterar senha
- **Método:** `POST`
- **Rota:** `/alterar-senha`
- **Autenticação:** pública

Exemplo de JSON:
```json
{
  "email": "admin@senac.br",
  "codigo": "123456",
  "novaSenha": "NovaSenha@2026"
}
```

## Rotas de Livros

### Criar livro [🔒 Requer Token]
- **Método:** `POST`
- **Rota:** `/livros`

Exemplo de JSON:
```json
{
  "titulo": "Arquitetura Limpa",
  "autor": "Robert C. Martin",
  "quant": 5,
  "preco_multa": 4.5
}
```

### Listar livros
- **Método:** `GET`
- **Rota:** `/livros`
- **Autenticação:** pública

Sem body.

### Excluir livro [🔒 Requer Token]
- **Método:** `DELETE`
- **Rota:** `/livros/:id`

Sem body. Exemplo:
```text
/livros/1
```

Observação: o utilizador autenticado não pode excluir mais de 5 livros no mesmo dia.

## Rotas de Alunos

### Criar aluno [🔒 Requer Token]
- **Método:** `POST`
- **Rota:** `/alunos`

Exemplo de JSON:
```json
{
  "nome": "João Silva",
  "email": "joao.silva@teste.com",
  "saldo_credit": 50.0
}
```

### Listar alunos
- **Método:** `GET`
- **Rota:** `/alunos`
- **Autenticação:** pública

Sem body.

### Excluir aluno [🔒 Requer Token]
- **Método:** `DELETE`
- **Rota:** `/alunos/:id`

Sem body. Exemplo:
```text
/alunos/1
```

## Rotas de Depósitos

### Criar depósito [🔒 Requer Token]
- **Método:** `POST`
- **Rota:** `/depositos`

Exemplo de JSON:
```json
{
  "alunoId": 1,
  "tipo": "PIX",
  "valor": 15.5
}
```

### Listar depósitos
- **Método:** `GET`
- **Rota:** `/depositos`
- **Autenticação:** pública

Sem body.

## Rotas de Empréstimos

### Criar empréstimo [🔒 Requer Token]
- **Método:** `POST`
- **Rota:** `/emprestimos`

Exemplo de JSON:
```json
{
  "alunoId": 1,
  "livroId": 1,
  "quant": 1
}
```

Observação: a operação consome `2.0 * quant` do saldo de crédito do aluno.

### Listar empréstimos [🔒 Requer Token]
- **Método:** `GET`
- **Rota:** `/emprestimos`

Sem body.

### Devolver livro [🔒 Requer Token]
- **Método:** `DELETE`
- **Rota:** `/emprestimos/:id`

Sem body. Exemplo:
```text
/emprestimos/1
```
