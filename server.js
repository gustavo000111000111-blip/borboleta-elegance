const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Banco PostgreSQL (Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Inicialização de Tabelas
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                preco NUMERIC(10, 2) NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                tamanhos TEXT DEFAULT '[]',
                cor VARCHAR(100) DEFAULT '',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS produto_fotos (
                id SERIAL PRIMARY KEY,
                produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
                url_foto TEXT NOT NULL,
                ordem INTEGER DEFAULT 1
            );
        `);
        console.log("Banco de dados PostgreSQL (Supabase) conectado e pronto!");
    } catch (err) {
        console.error("Erro ao inicializar tabelas no Postgres:", err);
    }
}
initDb();

// Configuração do Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'borboleta_produtos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// API: Listar Produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const queryText = `
            SELECT 
                p.id, p.nome, p.preco, p.categoria, p.tamanhos, p.cor,
                COALESCE(
                    json_agg(pf.url_foto ORDER BY pf.ordem) FILTER (WHERE pf.url_foto IS NOT NULL), 
                    '[]'
                ) as imgs
            FROM produtos p
            LEFT JOIN produto_fotos pf ON p.id = pf.produto_id
            GROUP BY p.id
            ORDER BY p.id DESC
        `;
        const { rows } = await pool.query(queryText);
        
        const produtosFormatados = rows.map(p => ({
            ...p,
            preco: parseFloat(p.preco),
            tamanhos: typeof p.tamanhos === 'string' ? JSON.parse(p.tamanhos) : p.tamanhos,
            cor: p.cor || ''
        }));

        res.json(produtosFormatados);
    } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        res.status(500).json({ error: "Erro ao buscar produtos" });
    }
});

// API: Cadastrar Produto
app.post('/api/produtos', upload.array('fotos', 5), async (req, res) => {
    const { nome, preco, categoria, tamanhos, cor } = req.body;
    const files = req.files;

    if (!files || files.length < 3 || files.length > 5) {
        return res.status(400).json({ error: "Selecione entre 3 e 5 fotos." });
    }

    const precoTratado = parseFloat(String(preco).replace(',', '.'));

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tamanhosTratados = Array.isArray(tamanhos) ? tamanhos : (tamanhos ? [tamanhos] : []);
        const tamanhosJson = JSON.stringify(tamanhosTratados);

        const insertProdText = `
            INSERT INTO produtos (nome, preco, categoria, tamanhos, cor)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        const prodRes = await client.query(insertProdText, [
            nome, 
            precoTratado, 
            categoria, 
            tamanhosJson, 
            cor || ''
        ]);
        const produtoId = prodRes.rows[0].id;

        for (let i = 0; i < files.length; i++) {
            const urlFoto = files[i].path;
            await client.query(
                `INSERT INTO produto_fotos (produto_id, url_foto, ordem) VALUES ($1, $2, $3)`,
                [produtoId, urlFoto, i + 1]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Produto cadastrado com sucesso!", id: produtoId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro ao cadastrar produto:", err);
        res.status(500).json({ error: "Erro ao cadastrar produto" });
    } finally {
        client.release();
    }
});

// API: Excluir Produto
app.delete('/api/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
        res.json({ message: "Produto removido com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar produto:", err);
        res.status(500).json({ error: "Erro ao deletar produto" });
    }
});

app.use((err, req, res, next) => {
    console.error("DETALHE DO ERRO:", JSON.stringify(err, null, 2), err.message || err);
    res.status(500).json({ error: err.message || "Erro interno no servidor" });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
