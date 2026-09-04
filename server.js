const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
// Altere de: const PORT = 3000;
// Para:
const PORT = process.env.PORT || 3000;

// Configuração do upload de imagens
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Middlewares
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadDir));

// Conexão com o Banco de Dados
const db = new sqlite3.Database('./borboleta.db', (err) => {
    if (err) console.error("Erro ao abrir banco:", err);
    else console.log("Conectado ao banco SQLite Borboleta Elegance.");
});

// Criar tabelas se não existirem
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            categoria TEXT NOT NULL,
            tamanhos TEXT DEFAULT '[]',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS produto_fotos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            produto_id INTEGER NOT NULL,
            url_foto TEXT NOT NULL,
            ordem INTEGER DEFAULT 1,
            FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
        )
    `);
});

// GET /api/produtos -> Usado pelo script.js do site e pelo painel Admin
app.get('/api/produtos', (req, res) => {
    const query = `
        SELECT p.id, p.nome, p.preco, p.categoria, p.tamanhos, 
               GROUP_CONCAT(pf.url_foto) as fotos
        FROM produtos p
        LEFT JOIN produto_fotos pf ON p.id = pf.produto_id
        GROUP BY p.id
        ORDER BY p.id DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const produtos = rows.map(r => ({
            id: r.id,
            nome: r.nome,
            name: r.nome,
            preco: r.preco,
            price: r.preco,
            categoria: r.categoria,
            tamanhos: JSON.parse(r.tamanhos || '[]'),
            imgs: r.fotos ? r.fotos.split(',') : []
        }));
        
        res.json(produtos);
    });
});

// POST /api/produtos -> Adicionar produto com imagens
app.post('/api/produtos', upload.array('fotos', 5), (req, res) => {
    const { nome, preco, categoria, tamanhos } = req.body;
    const files = req.files || [];

    // Validação estrita de 3 a 5 fotos
    if (files.length < 3 || files.length > 5) {
        // Remover arquivos salvos em caso de falha de validação
        files.forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ error: "É necessário enviar entre 3 e 5 fotos." });
    }

    const priceNum = parseFloat(preco.toString().replace('R$', '').replace('.', '').replace(',', '.').trim());
    const tamanhosJson = JSON.stringify(categoria === 'acessorios' ? [] : (Array.isArray(tamanhos) ? tamanhos : [tamanhos]));

    db.run(
        `INSERT INTO produtos (nome, preco, categoria, tamanhos) VALUES (?, ?, ?, ?)`,
        [nome, priceNum, categoria, tamanhosJson],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const produtoId = this.lastID;
            const stmt = db.prepare(`INSERT INTO produto_fotos (produto_id, url_foto, ordem) VALUES (?, ?, ?)`);
            
            files.forEach((file, index) => {
                const imgUrl = `/uploads/${file.filename}`;
                stmt.run(produtoId, imgUrl, index + 1);
            });
            stmt.finalize();

            res.json({ success: true, message: "Produto cadastrado com sucesso!" });
        }
    );
});

// DELETE /api/produtos/:id -> Excluir produto e fotos associadas
app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;

    // Buscar fotos para deletar arquivos do disco
    db.all(`SELECT url_foto FROM produto_fotos WHERE produto_id = ?`, [id], (err, rows) => {
        if (!err && rows) {
            rows.forEach(r => {
                const filePath = path.join(__dirname, r.url_foto);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }

        db.run(`DELETE FROM produtos WHERE id = ?`, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Produto removido com sucesso!" });
        });
    });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));