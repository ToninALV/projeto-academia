require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const pontoRoutes = require('./routes/pontoRoutes');
const logger = require('./config/logger');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_IP = process.env.SERVER_IP || 'localhost';

// Configurações de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado para aceitar requisições externas
app.use(cors({
  origin: '*', // EM PRODUÇÃO: especifique domínios permitidos
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'multipart/form-data'],
  credentials: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 1 minuto.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/ponto', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos com path absoluto
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || './uploads')));

// Log das requisições
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  logger.info(`${req.method} ${req.url} - IP: ${clientIP}`);
  console.log(`📡 ${req.method} ${req.url} - IP: ${clientIP}`);
  next();
});

// Usar as rotas
app.use('/', pontoRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
  logger.error(`Erro: ${err.message}`, { stack: err.stack });
  console.error('❌ Erro:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Máximo permitido: 5MB',
      error: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de arquivo inválido',
      error: 'INVALID_FILE_FIELD'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    error: 'NOT_FOUND'
  });
});

// Inicialização
async function startServer() {
  try {
    // Criar diretórios com paths absolutos
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads/fotos');
    const dbDir = path.resolve('./database');
    const logsDir = path.resolve('./logs');
    
    [uploadDir, dbDir, logsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${dir}`);
      }
    });

    // Inicializar banco
    await initDatabase();
    
    // Iniciar servidor escutando em todas as interfaces
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀=================================🚀');
      console.log(`   SERVIDOR INICIADO COM SUCESSO!`);
      console.log('🚀=================================🚀');
      console.log(`📡 URL Local: http://localhost:${PORT}`);
      console.log(`🌐 URL Externa: http://${SERVER_IP}:${PORT}`);
      console.log(`📋 Endpoint principal: http://${SERVER_IP}:${PORT}/ponto`);
      console.log(`📁 Upload de fotos: ${uploadDir}`);
      console.log(`🗄️ Banco de dados: ${path.resolve(process.env.DB_PATH || './database/pontos.db')}`);
      console.log('🚀=================================🚀');
      
      logger.info(`Servidor iniciado - Porta: ${PORT}, IP: ${SERVER_IP}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

// Tratamento de sinais para shutdown graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});