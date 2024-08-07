import {
  adicionarConexao,
  encontrarConexao,
  obterUsuariosDocumento,
  removerConexao,
} from "../utils/conexoesDocumentos.js";
import {
  atualizaDocumento,
  encontrarDocumento,
  excluirDocumento,
} from "../db/documentosDb.js";

function registrarEventosDocumento(socket, io) {
  socket.on(
    "selecionar_documento",
    async ({ nomeDocumento, nomeUsuario }, devolverTexto) => {
      try {
        const documento = await encontrarDocumento(nomeDocumento);

        if (documento) {
          const conexaoEncontrada = encontrarConexao(
            nomeDocumento,
            nomeUsuario
          );

          if (!conexaoEncontrada) {
            socket.join(nomeDocumento);

            adicionarConexao({ nomeDocumento, nomeUsuario, id: socket.id });

            socket.data = {
              usuarioEntrou: true,
            };

            const usuariosAtivos = obterUsuariosDocumento(nomeDocumento);

            io.to(nomeDocumento).emit("usuarios_ativos", usuariosAtivos);

            devolverTexto(documento.texto);
          } else {
            socket.emit("usuario_no_documento");
          }
        } else {
          devolverTexto(null);
        }
      } catch (error) {
        console.error(`Erro ao selecionar documento: ${error.message}`);
        devolverTexto(null);
      }

      socket.on("texto_editor", async ({ texto, nomeDocumento }) => {
        try {
          const atualizacao = await atualizaDocumento(nomeDocumento, texto);

          if (atualizacao.modifiedCount) {
            socket.to(nomeDocumento).emit("texto_editor_clientes", texto);
          }
        } catch (error) {
          console.error(`Erro ao atualizar documento: ${error.message}`);
        }
      });

      socket.on("excluir_documento", async (nome) => {
        const exclusao = await excluirDocumento(nome);
        if (exclusao.deletedCount) {
          io.emit("excluir_documento_interface", nome);
        }
      });

      socket.on("disconnect", () => {
        if (socket.data.usuarioEntrou) {
          removerConexao(socket.id);

          const usuariosAtivos = obterUsuariosDocumento(nomeDocumento);

          io.to(nomeDocumento).emit("usuarios_ativos", usuariosAtivos);
        }
      });
    }
  );
}

export default registrarEventosDocumento;
