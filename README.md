# projeto-academia
Projeto criado para o desafio da academia entre amigos.

// ============================================
// ARQUIVO: .gitignore
// ============================================
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
database/*.db
database/*.sqlite
database/*.sqlite3

# Uploads
uploads/
!uploads/.gitkeep

# Logs
logs/
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

// ============================================
// ARQUIVO: README.md
// ============================================
# Backend Sistema de Ponto Academia

API RESTful para sistema de ponto de academia com upload de fotos e controle de pontuação.

## 📋 Características

- ✅ Endpoint POST /ponto para registro de pontos
- ✅ Upload de fotos com validação
- ✅ Banco de dados SQLite
- ✅ Rate limiting (10 req/min por IP)
- ✅ Logs detalhados
- ✅ CORS habilitado
- ✅ Validação robusta
- ✅ Tratamento de erros

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone <seu-repo>
cd backend-ponto-academia
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as configurações se necessário
nano .env
```

### 4. Execute o servidor
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuração SQLite
│   │   └── logger.js        # Sistema de logs
│   ├── middleware/
│   │   └── upload.js        # Configuração Multer
│   ├── routes/
│   │   └── pontoRoutes.js   # Rotas da API
│   └── server.js            # Servidor principal
├── database/                # Banco de dados SQLite
├── uploads/fotos/          # Fotos enviadas
├── logs/                   # Arquivos de log
├── .env                    # Variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### POST /ponto
Registra um novo ponto com foto.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `nome` (string, required): Nome do participante (min 2 chars)
  - `foto` (file, required): Arquivo JPG/PNG (max 5MB)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Ponto registrado com sucesso!",
  "dados": {
    "nome": "João Silva",
    "pontos": 1,
    "data_registro": "2024-01-15T10:30:00Z"
  }
}
```

**Response Error (400/500):**
```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "codigo_do_erro"
}
```

### GET /pontos (Opcional)
Lista todos os registros de ponto.

**Query Parameters:**
- `limit` (number): Limite de resultados (default: 50)

### GET /pontos/:nome (Opcional)
Consulta pontos totais de uma pessoa.

### GET /
Status da API e lista de endpoints.

## 🗄️ Banco de Dados

O sistema usa SQLite com a seguinte estrutura:

```sql
CREATE TABLE pontos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(255) NOT NULL,
  foto_path VARCHAR(500) NOT NULL,
  pontos INTEGER DEFAULT 1,
  data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## ⚙️ Configurações (.env)

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Banco de dados
DB_PATH=./database/pontos.db

# Upload
UPLOAD_DIR=./uploads/fotos
MAX_FILE_SIZE=5242880

# Rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
```

## 🧪 Teste Manual

### Usando cURL:
```bash
curl -X POST http://localhost:3000/ponto \
  -F "nome=João Silva" \
  -F "foto=@/path/to/photo.jpg"
```

### Usando Postman/Insomnia:
1. POST http://localhost:3000/ponto
2. Body: form-data
3. Adicionar campos: nome (text) e foto (file)

## 📊 Logs

Os logs são salvos em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todas as atividades

## 🔒 Segurança

- Rate limiting: 10 requests/minuto por IP
- Validação de tipos de arquivo (JPG, PNG)
- Sanitização de nomes de arquivo
- Headers de segurança com Helmet
- Validação de entrada robusta

## 🐛 Tratamento de Erros

A API retorna códigos de erro específicos:
- `VALIDATION_ERROR` - Dados inválidos
- `MISSING_PHOTO` - Foto não enviada
- `FILE_TOO_LARGE` - Arquivo maior que 5MB
- `RATE_LIMIT_EXCEEDED` - Muitas tentativas
- `INTERNAL_ERROR` - Erro do servidor

## 📱 Compatibilidade Frontend

Este backend é 100% compatível com frontend que envia FormData contendo:
```javascript
const formData = new FormData();
formData.append('nome', 'João Silva');
formData.append('foto', fileInput.files[0]);

fetch('http://localhost:3000/ponto', {
  method: 'POST',
  body: formData
});
```

## 🚧 Desenvolvimento

Para contribuir:
1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Faça commit: `git commit -m 'Add nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

✅ **API pronta para integração com frontend!**