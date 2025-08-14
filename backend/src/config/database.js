const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('./logger');

const dbPath = path.resolve(process.env.DB_PATH || './database/pontos.db');

function getDatabase() {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Erro ao conectar com banco:', err.message);
      logger.error('Erro ao conectar com banco de dados:', err);
    }
  });
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS pontos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(255) NOT NULL,
        foto_path VARCHAR(500) NOT NULL,
        pontos INTEGER DEFAULT 1,
        data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('❌ Erro ao criar tabela:', err.message);
        logger.error('Erro ao criar tabela:', err);
        reject(err);
      } else {
        console.log('✅ Banco de dados inicializado');
        console.log(`📊 Arquivo do banco: ${dbPath}`);
        logger.info('Tabela "pontos" criada/verificada com sucesso');
        resolve();
      }
      db.close();
    });
  });
}

function insertPonto(nome, fotoPath) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    const insertSQL = `
      INSERT INTO pontos (nome, foto_path, pontos, data_registro) 
      VALUES (?, ?, 1, datetime('now', 'localtime'))
    `;

    db.run(insertSQL, [nome, fotoPath], function(err) {
      if (err) {
        console.error('❌ Erro ao inserir ponto:', err.message);
        logger.error('Erro ao inserir ponto:', err);
        reject(err);
      } else {
        const selectSQL = `
          SELECT id, nome, pontos, 
                 strftime('%Y-%m-%dT%H:%M:%S', data_registro) as data_registro 
          FROM pontos WHERE id = ?
        `;
        
        db.get(selectSQL, [this.lastID], (err, row) => {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Ponto inserido - ID: ${row.id}, Nome: ${row.nome}`);
            resolve(row);
          }
          db.close();
        });
      }
    });
  });
}

// Função para consultar pontos (opcional)
function getPontos(limit = 50) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    const selectSQL = `
      SELECT id, nome, foto_path, pontos, 
             strftime('%Y-%m-%dT%H:%M:%S', data_registro) as data_registro 
      FROM pontos 
      ORDER BY data_registro DESC 
      LIMIT ?
    `;

    db.all(selectSQL, [limit], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

module.exports = {
  initDatabase,
  insertPonto,
  getPontos
};