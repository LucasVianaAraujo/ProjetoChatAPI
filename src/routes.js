import Usuario from './controller/usuario.js'

export default function AdicionarRotas(api) {
    api.use(Usuario)
}