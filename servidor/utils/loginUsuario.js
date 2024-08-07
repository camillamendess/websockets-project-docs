import { scryptSync, timingSafeEqual } from "crypto";

function loginUsuario(senhaDigitada, usuario) {
  const hashTeste = scryptSync(senhaDigitada, usuario.salSenha, 64);

  const hashReal = Buffer.from(usuario.hashSenha, "hex");

  const autenticado = timingSafeEqual(hashTeste, hashReal);

  return autenticado;
}

export default loginUsuario;