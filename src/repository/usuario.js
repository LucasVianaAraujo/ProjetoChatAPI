import { connection } from "./connection.js";

export async function CriarUsuario(NovoUsuario) {
    const comando = `
    INSERT INTO usuario (nome, email, senha)
    VALUES
    (?,?,MD5(?))
    `

    const [info] = await connection.query(comando, [
        NovoUsuario.nome,
        NovoUsuario.email,
        NovoUsuario.senha
    ])

    return info.affectedRows;
}

export async function LoginUsuario(email, senha) {
    const comando = `
    SELECT id, nome, email
    FROM usuario
    WHERE email = ?
    AND senha = MD5(?)
    `

    const [info] = await connection.query(comando, [email, senha])
    return info[0];
}

export async function CriarSala(NovaSala, usuario_id) {
    const comando = `
    INSERT INTO sala (nome, usuario_id)
    VALUES (?,?)
    `

    const [info] = await connection.query(comando, [
        NovaSala.nome,
        usuario_id
    ]);

    const sala_id = info.insertId; // isso aqui ta pegando o último id automaticamente, dps é só repetir na continuação do endpoint. É tipo o last_insert_id() no mysql;

    const comando1 = `
    INSERT INTO salaPermissao (sala_id, usuario_id, aprovado)
    VALUES
    (?,?,?)
    `

    const [info1] = await connection.query(comando1, [
        sala_id,
        usuario_id,
        true
    ])

    return [sala_id];
}

export async function SalaPermissao(usuario_id, sala) {
    const comando = `
    SELECT id
    FROM salaPermissao
    WHERE sala_id = ?
    AND usuario_id = ?
    `

    const [info] = await connection.query(comando, [
        sala,
        usuario_id
    ])

    if (info.length > 0) {
        return { erro: "Você já está na sala, bobo" }
    }
}

export async function AprovarUsuario(sala, usuario_id) {
    const comando = `
    SELECT usuario_id
    FROM sala
    WHERE id = ?
    `

    const [info] = await connection.query(comando, [
        sala
    ]);

    if (info.length === 0) {
        return { erro: "Ué, carinha, essa sala não existe!" }
    }

    const comando1 = `
    UPDATE salaPermissao
    SET aprovado = true
    WHERE sala_id = ?
    AND usuario_id = ?
    `

    const [info1] = await connection.query(comando1, [
        sala,
        usuario_id
    ])
    return { info, info1 };
}

export async function EnviarMensagem(sala, usuario_id, mensagem) {
    const comando = `
    SELECT id 
    FROM salaPermissao
    WHERE sala_id = ?
    AND usuario_id = ?
    AND aprovado = true 
    `

    const [info] = await connection.query(comando, [
        sala,
        usuario_id
    ])

    if (info.length === 0) {
        return { mensagem: "Espera aí, você não tem permissão para enviar mensagens nesse chat!" };
    }

    const comando1 = `
    INSERT INTO chat (usuario_id, sala_id, mensagem, criacao)
    VALUES
    (?,?,?,?)
    `

    const [info1] = await connection.query(comando1, [
        usuario_id,
        sala,
        mensagem.mensagem,
        new Date()
    ])

    return { info1 }
}

export async function HistóricoChat(sala, usuario_id) {
    const comando = `
    SELECT id
    FROM salaPermissao
    WHERE sala_id = ?
    AND usuario_id = ?
    AND aprovado = true
    `

    const [info] = await connection.query(comando, [
        sala,
        usuario_id
    ])

    if (info.length === 0) {
        return { erro: "Há, há, você não tem permissão para bisbilhotar essa conversa!" }
    }

    const comando1 = `
    SELECT chat.id,
    chat.usuario_id,
    nome,
    mensagem,
    criacao
    FROM chat
    JOIN usuario ON chat.usuario_id = usuario.id
    WHERE sala_id = ?
    ORDER 
    BY criacao ASC;
    `

    const [info1] = await connection.query(comando1, [
        sala
    ])

    return { info, info1 };
}