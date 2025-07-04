document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const bemvindoUser = document.getElementById("bemvindoUser");
  const usuarioAtual = document.getElementById("atualUser");
  const avisoMsg = document.getElementById("avisoMsg");


  const themeToggle = document.getElementById("toggleTheme");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-theme");
    });
  }


  if (bemvindoUser) bemvindoUser.textContent = usuarioLogado;
  if (usuarioAtual) usuarioAtual.textContent = usuarioLogado;


  function getUsuarios() {
    const dadosSalvos = localStorage.getItem("usuarios");
    if (dadosSalvos) {
      return JSON.parse(dadosSalvos);
    }
    return [];
  }


  function saveUsers(users) {
    localStorage.setItem("usuarios", JSON.stringify(users));
  }


  window.registroUser = function() {
    const username = document.getElementById('username').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const users = getUsuarios();

    if (username === "") {
      alert("O campo de nome de usuário está vazio.");
      return;
    }

    if (senha === "") {
      alert("O campo de senha está vazio.");
      return;
    }

    let c1 = 0;
    let jaExiste = false;

    while (c1 < users.length) {
      let usuarioLogado = users[c1];

      if (usuarioLogado.username === username) {
        jaExiste = true;
        break;
      }

      c1++;
    }
    if (jaExiste) {
      alert("Usuário já existe.");
      return;
    }
    users.push({ username, senha });
    saveUsers(users);
    alert("Usuário cadastrado com sucesso!");
  };


  window.loginUsuario = function () {
    const loginUsuario = document.getElementById('loginUsuario').value.trim();
    const loginSenha = document.getElementById('loginSenha').value.trim();
    const users = getUsuarios();
    const msg = document.getElementById('loginMessage');

    let usuarioEncontrado = null;
    let i = 0;

    while (i < users.length) {
      let usuarioLogado = users[i];

      if (usuarioLogado.username === loginUsuario && usuarioLogado.senha === loginSenha) {
        usuarioEncontrado = usuarioLogado;
        break;
      }

      i++;
    }

    if (usuarioEncontrado) {
      msg.textContent = `Bem-vindo, ${loginUsuario}!`;
      msg.style.color = 'green';

      localStorage.setItem('usuarioLogado', loginUsuario);

      setTimeout(function() {
        window.location.href = "home.html";
      }, 1000);
    } else {
      msg.textContent = "Usuário ou senha incorretos.";
      msg.style.color = 'red';
    }
  };

 
  const logoutBotao = document.getElementById("logoutBotao");
  if (logoutBotao) {
    logoutBotao.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "index.html";
    });
  }


  const secao = document.getElementById("secaoTarefas");
  if (usuarioLogado && secao) {
    secao.style.display = "block";
    exibirTarefas();
  }


  function obterTarefas() {
    let tarefasSalvas = localStorage.getItem(`tarefas_${usuarioLogado}`);

    if (tarefasSalvas === null) {
      return [];
    }
    return JSON.parse(tarefasSalvas);
  }

  
  function salvarTarefas(tarefas) {
    localStorage.setItem(`tarefas_${usuarioLogado}`, JSON.stringify(tarefas));
  }

  
  window.adicionarTarefa = function () {
    const titulo = document.getElementById("tituloTarefa").value.trim();
    const descricao = document.getElementById("descricaoTarefa").value.trim();

  if (titulo === "") {
    alert("O campo de título está vazio.");
    return;
  }

  if (descricao === "") {
    alert("O campo de descrição está vazio.");
    return;
  }

    const tarefas = obterTarefas();
    tarefas.push({ titulo, descricao });
    salvarTarefas(tarefas);

    document.getElementById("tituloTarefa").value = "";
    document.getElementById("descricaoTarefa").value = "";
    exibirTarefas();
  };

  function exibirTarefas() {
    const inner = document.getElementById("innerCarrosselTarefas");
    if (!inner) return;

    const tarefas = obterTarefas();
    inner.innerHTML = "";

    if (tarefas.length === 0) {
      inner.innerHTML = `
        <div class="carousel-item active">
          <div class="card mx-auto" style="width: 18rem;">
            <div class="card-body">
              <p class="card-text text-center">Nenhuma obrigação cadastrada.</p>
            </div>
          </div>
        </div>`;
    } else {
      tarefas.forEach((tarefa, i) => {
        const item = document.createElement("div");
        if (i === 0) {
          item.className = "carousel-item active";
        } else {
          item.className = "carousel-item";
        }
        item.innerHTML = `
          <div class="card mx-auto" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">${tarefa.titulo}</h5>
              <p class="card-text">${tarefa.descricao}</p>
              <button class="btn btn-warning btn-sm me-2" onclick="editarTarefa(${i})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="excluirTarefa(${i})">Excluir</button>
            </div>
          </div>`;
        inner.appendChild(item);
      });
    }


    const carrosselElement = document.querySelector('#carrosselTarefas');
    if (carrosselElement) {
      if (tarefas.length > 1) {
        new bootstrap.Carousel(carrosselElement, {
          interval: 3000,
          ride: 'carousel',
          pause: 'hover',
          wrap: true
        });
      }
    }
  }


  let posicaoLista = null;
  window.excluirTarefa = function (index) {
    posicaoLista = index;
    const modal = new bootstrap.Modal(document.getElementById("modalExcluirTarefa"));
    modal.show();
  };

  const confirmarExclusaoBtn = document.getElementById("confirmarExclusaoBtn");
  if (confirmarExclusaoBtn) {
    confirmarExclusaoBtn.addEventListener("click", () => {
      if (posicaoLista === null) return;
      const tarefas = obterTarefas();
      tarefas.splice(posicaoLista, 1);
      salvarTarefas(tarefas);
      exibirTarefas();
      posicaoLista = null;
      bootstrap.Modal.getInstance(document.getElementById("modalExcluirTarefa")).hide();
    });
  }


  let posicaoEdicao = null;
  window.editarTarefa = function (index) {
    const tarefa = obterTarefas()[index];
    document.getElementById("editarTitulo").value = tarefa.titulo;
    document.getElementById("editarDescricao").value = tarefa.descricao;
    posicaoEdicao = index;
    new bootstrap.Modal(document.getElementById("modalEditarTarefa")).show();
  };

  const salvarEdicaoBtn = document.getElementById("salvarEdicaoBtn");
  if (salvarEdicaoBtn) {
    salvarEdicaoBtn.addEventListener("click", () => {
      const novoTitulo = document.getElementById("editarTitulo").value.trim();
      const novaDescricao = document.getElementById("editarDescricao").value.trim();

      if (novoTitulo === "") {
        alert("O campo de título está vazio.");
        return;
      }

      if (novaDescricao === "") {
        alert("O campo de descrição está vazio.");
        return;
      }

      const tarefas = obterTarefas();
      tarefas[posicaoEdicao] = { titulo: novoTitulo, descricao: novaDescricao };
      salvarTarefas(tarefas);
      exibirTarefas();
      bootstrap.Modal.getInstance(document.getElementById("modalEditarTarefa")).hide();
    });
  }


  
  const botaoSalvar = document.getElementById("salvarMudancasBotao");
  if (botaoSalvar) {
    let mudancasPendentes = null;

    botaoSalvar.addEventListener("click", () => {
      const senhaAntiga = document.getElementById("senhaAntiga").value.trim();
      const novoNome = document.getElementById("novoNome").value.trim();
      const novaSenha = document.getElementById("novaSenha").value.trim();
      const users = getUsuarios();

      if (senhaAntiga === "") {
        avisoMsg.textContent = "Preencha o campo de senha atual.";
        avisoMsg.style.color = "red";
        return;
      }

      if (novoNome === "") {
        avisoMsg.textContent = "Preencha o campo de novo nome de usuário.";
        avisoMsg.style.color = "red";
        return;
      }

      if (novaSenha === "") {
        avisoMsg.textContent = "Preencha o campo de nova senha.";
        avisoMsg.style.color = "red";
        return;
      }

      let usuario = localStorage.getItem("usuarioLogado");
      let indiceUsuario = -1;

      for (let i = 0; i < users.length; i++) {
        if (users[i].username === usuario) {
          indiceUsuario = i;
          break;
        }
      }

      if (indiceUsuario === -1) {
        avisoMsg.textContent = "Usuário não encontrado.";
        avisoMsg.style.color = "red";
        return;
      }

      const usuarioEncontrado = users[indiceUsuario];

      if (usuarioEncontrado.senha !== senhaAntiga) {
        avisoMsg.textContent = "Senha atual incorreta.";
        avisoMsg.style.color = "red";
        return;
      }

      let usuarioExiste = false;
      for (let i = 0; i < users.length; i++) {
        if (users[i].username === novoNome && i !== indiceUsuario) {
          usuarioExiste = true;
          break;
        }
      }

      if (usuarioExiste) {
        avisoMsg.textContent = "Este nome de usuário já está em uso.";
        avisoMsg.style.color = "red";
        return;
      }

      mudancasPendentes = { indiceUsuario, novoNome, novaSenha, users };
      new bootstrap.Modal(document.getElementById("modalConfirmacao")).show();
    });

    const confirmarBotao = document.getElementById("confirmarBotao");
    if (confirmarBotao) {
      confirmarBotao.addEventListener("click", () => {
        
        if (mudancasPendentes == null) {
          return;
        }

        const { indiceUsuario, novoNome, novaSenha, users } = mudancasPendentes;

        const tarefasAntigas = localStorage.getItem(`tarefas_${usuarioLogado}`);
        if (tarefasAntigas) {
          localStorage.setItem(`tarefas_${novoNome}`, tarefasAntigas);
          localStorage.removeItem(`tarefas_${usuarioLogado}`);
        }

        users[indiceUsuario] = { username: novoNome, senha: novaSenha };
        saveUsers(users);
        localStorage.setItem("usuarioLogado", novoNome);

        if (bemvindoUser) bemvindoUser.textContent = novoNome;
        if (usuarioAtual) usuarioAtual.textContent = novoNome;

        avisoMsg.textContent = "Cadastro atualizado com sucesso!";
        avisoMsg.style.color = "green";

        document.getElementById("senhaAntiga").value = "";
        document.getElementById("novoNome").value = "";
        document.getElementById("novaSenha").value = "";

        bootstrap.Modal.getInstance(document.getElementById("modalConfirmacao")).hide();
      });
    }
  }


  const excluirConta = document.getElementById("excluirConta");
  if (excluirConta) {
    excluirConta.addEventListener("click", () => {
      new bootstrap.Modal(document.getElementById("modalExcluirConta")).show();
    });
  }

  const confirmarExclusaoConta = document.getElementById("confirmarExclusaoConta");
  if (confirmarExclusaoConta) {
    confirmarExclusaoConta.addEventListener("click", () => {
      let listaUsuarios = getUsuarios();
      let novaLista = [];

      for (let i = 0; i < listaUsuarios.length; i++) {
        let usuario = listaUsuarios[i];
        if (usuario.username !== usuarioLogado) {
          novaLista.push(usuario);
        }
      }

      saveUsers(novaLista);
      localStorage.removeItem(`tarefas_${usuarioLogado}`);
      localStorage.removeItem("usuarioLogado");
      window.location.href = "index.html";
      });
  }
});