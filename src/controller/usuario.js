import { CriarUsuario, LoginUsuario, CriarSala, SalaPermissao, AprovarUsuario, EnviarMensagem, HistóricoChat } from "../repository/usuario.js";

import { Router } from "express";

import { getAuthentication, generateToken } from "../utils/jwt.js";
const autenticador = getAuthentication();

const endpoint = Router();

endpoint.post('/usuario', async (req, resp) => {
    const NovoUsuario = req.body;

    const registro = await CriarUsuario(NovoUsuario);
    resp.send(
        {
            registro: (registro),
            mensagem: "Usuário Enviado!"
        });
})

endpoint.get('/usuario/login', async (req, resp) => {
    const email = req.body.email;
    const senha = req.body.senha;

    const registro = await LoginUsuario(email, senha);
    resp.send({
        mensagem: "Usuário Encontrado!",
        token: generateToken(registro)
    })
})

endpoint.post('/sala', autenticador, async (req, resp) => {
    const NovaSala = req.body;
    const usuario_id = req.user.id;

    const registro = await CriarSala(NovaSala, usuario_id);
    resp.send({
        "Mensagem": "Sala Criada!",
        "Id Sala": (registro)
    });
})

endpoint.post('/sala/:sala/entrar', autenticador, async (req, resp) => {
    const sala = req.params.sala;
    const usuario_id = req.user.id;

    const registro = await SalaPermissao(usuario_id, sala);
    resp.send(registro);
})

endpoint.post('/sala/:sala/aprovar/:usuario', autenticador, async (req, resp) => {
    const sala = req.params.sala;
    const usuario_id = req.params.usuario;

    const registro = await AprovarUsuario(sala, usuario_id);
    resp.send(registro);
})

endpoint.post('/chat/:sala', autenticador, async (req, resp) => {
    const sala = req.params.sala;
    const usuario_id = req.user.id;
    const mensagem = req.body;

    const registro = await EnviarMensagem(sala, usuario_id, mensagem);
    resp.send(registro);
})

endpoint.get('/chat/:sala', autenticador, async (req, resp) => {
    const sala = req.params.sala;
    const usuario_id = req.user.id;

    const registro = await HistóricoChat(sala, usuario_id);
    resp.send(registro);
})

export default endpoint;