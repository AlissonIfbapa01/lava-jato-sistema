const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();


app.use(cors());
// Limite maior para comportar a foto de perfil (base64) enviada junto com os dados do sistema.
app.use(express.json({ limit: '8mb' }));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'lava_app',
    password: process.env.DB_PASSWORD,
    database: 'lava_jato',
    waitForConnections: true,
    connectionLimit: 10
});

app.get('/', (req, res) => {
    res.json({
        mensagem: 'Servidor do Lava-Jato Dois Irmãos funcionando!'
    });
});

app.get('/api/teste-banco', async (req, res) => {
    try {
        const [resultado] = await pool.query('SELECT 1 AS conectado');

        res.json({
            sucesso: true,
            banco: resultado
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            erro: 'Erro ao conectar com o banco de dados'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Informe usuário e senha'
            });
        }

        const [usuarios] = await pool.query(
            'SELECT id, usuario, senha FROM usuarios WHERE usuario = ? LIMIT 1',
            [usuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário ou senha incorretos'
            });
        }

        const usuarioBanco = usuarios[0];

        let senhaCorreta = false;

        if (usuarioBanco.senha.startsWith('$2b$')) {
            senhaCorreta = await bcrypt.compare(
                senha,
                usuarioBanco.senha
            );
        } else {
            senhaCorreta = senha === usuarioBanco.senha;
        }

        if (!senhaCorreta) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Usuário ou senha incorretos'
            });
        }

        res.json({
            sucesso: true,
            usuario: {
                id: usuarioBanco.id,
                nome: usuarioBanco.usuario
            }
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno no servidor'
        });
    }
});
app.get("/api/dados", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT dados FROM sistema_dados WHERE id = 1"
        );

        if (rows.length === 0) {
            return res.json({ dados: null });
        }

        res.json({
            dados: JSON.parse(rows[0].dados)
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao carregar dados"
        });
    }
});

app.post("/api/dados", async (req, res) => {
    try {
        const dados = JSON.stringify(req.body);

        await pool.query(
            `INSERT INTO sistema_dados (id, dados)
             VALUES (1, ?)
             ON DUPLICATE KEY UPDATE dados = VALUES(dados)`,
            [dados]
        );

        res.json({
            sucesso: true
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao salvar dados"
        });
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor rodando na porta 3000');
});
