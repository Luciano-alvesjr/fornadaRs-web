# Fornada — backend

API de produtos e pedidos em Java 17, Spring Boot, JPA e Lombok.

## Configurar o PostgreSQL

Crie o banco no PostgreSQL (por exemplo, usando pgAdmin):

```sql
CREATE DATABASE fornada;
```

No IntelliJ: Run > Edit Configurations > FornadarsWebApplication > Environment variables.
Configure:
- DB_URL=jdbc:postgresql://localhost:5432/fornada
- DB_USER=postgres
- DB_PASSWORD=sua_senha_local

DB_URL e DB_USER têm os valores acima como padrão. DB_PASSWORD é obrigatório.
Não salve senhas no Git. Execute FornadarsWebApplication; a API usa a porta 8080.
O Hibernate cria/atualiza as tabelas com ddl-auto=update, apenas para desenvolvimento.
Em produção, substitua por migrations e validação do esquema.
A conexão real com PostgreSQL deve ser verificada após configurar o banco.

## Produtos

| Método | Rota | Operação |
| --- | --- | --- |
| POST | /produtos | Cadastrar |
| GET | /produtos | Listar |
| GET | /produtos/{id} | Consultar |
| PUT | /produtos/{id} | Atualizar nome e preço |
| DELETE | /produtos/{id} | Excluir se não estiver em pedidos |

POST e PUT:
```json
{"nome":"Pão de queijo","preco":5.50}
```

Nome é obrigatório (até 120 caracteres). Preço deve ser positivo,
com no máximo duas casas decimais e dez dígitos inteiros.
POST responde 201 com Location; DELETE responde 204.

## Pedidos

| Método | Rota | Operação |
| --- | --- | --- |
| POST | /pedidos | Criar com produtos existentes |
| GET | /pedidos | Listar |
| GET | /pedidos/{id} | Consultar |
| PATCH | /pedidos/{id}/status | Atualizar status |

POST:
```json
{"itens":[{"produtoId":1,"quantidade":2}]}
```

De 1 a 100 itens, quantidade de 1 a 10000 por item.
O servidor usa o preço do banco e guarda esse preço em cada item.
Alterar o preço de um produto não altera o total dos pedidos existentes.
A data é gerada pelo servidor. O total é calculado a partir dos itens.
Pedidos não são excluídos: use o status CANCELADO para preservar o histórico.
O nome do produto exibido no pedido é o nome atual do cadastro.

PATCH:
```json
{"status":"EM_PREPARO"}
```

Fluxo: RECEBIDO -> EM_PREPARO -> PRONTO -> ENTREGUE.
Pode cancelar em RECEBIDO, EM_PREPARO e PRONTO.
ENTREGUE e CANCELADO são finais. Repetir o status atual é permitido.

Erros: 400 para entrada inválida, 404 para recurso inexistente e 409 para
transição não permitida ou exclusão de produto referenciado em pedido.
Respostas de erro usam ProblemDetail. A API ainda não tem autenticação,
paginação, estoque ou pagamentos; estes recursos dependem de requisitos próprios.

## Testes

```text
mvnw.cmd test
```

Testes usam H2 em memória, sem precisar do PostgreSQL, e verificam as rotas HTTP,
persistência, validações, total com vários itens, preço histórico e status.
No IntelliJ, também é possível executar FornadarsWebApplicationTests.
