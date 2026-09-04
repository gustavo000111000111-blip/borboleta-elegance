
-- Tabela principal de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(150) NOT NULL,
    preco REAL NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK(categoria IN ('roupas', 'acessorios')),
    tamanhos TEXT DEFAULT '[]', -- Armazena JSON com os tamanhos: ["P", "M", "G"]
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para galeria de fotos (mínimo 3, máximo 5 por produto)
CREATE TABLE IF NOT EXISTS produto_fotos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    url_foto TEXT NOT NULL,
    ordem INTEGER DEFAULT 1,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);