// Armazena o ID da janela popup aberta
let loginPopupWindowId = null;

// Quando o usuário clica no ícone da extensão
chrome.action.onClicked.addListener(() => {
  if (loginPopupWindowId !== null) {
    // Verifica se a janela ainda existe
    chrome.windows.get(loginPopupWindowId, (existingWindow) => {
      if (chrome.runtime.lastError || !existingWindow) {
        // Janela foi fechada ou não existe mais — cria novamente
        abrirPopupComBaseNoLogin();
      } else {
        // Janela ainda está aberta — apenas foca nela
        chrome.windows.update(loginPopupWindowId, { focused: true });
      }
    });
  } else {
    // Nenhuma janela registrada — cria nova
    abrirPopupComBaseNoLogin();
  }
});

// Decide qual HTML abrir com base no status de login salvo
function abrirPopupComBaseNoLogin() {
  chrome.storage.local.get('isLogedIn', (result) => {
    const usuarioLogado = result.isLogedIn === true;
    const paginaInicial = usuarioLogado ? 'painel.html' : 'login.html';

    chrome.windows.create({
      url: chrome.runtime.getURL(paginaInicial),
      type: 'popup',
      width: 320,
      height: 420
    }, (novaJanela) => {
      loginPopupWindowId = novaJanela.id;
    });
  });
}

// Limpa a referência quando a janela for fechada
chrome.windows.onRemoved.addListener((janelaFechadaId) => {
  if (janelaFechadaId === loginPopupWindowId) {
    loginPopupWindowId = null;
  }
});

chrome.windows.onBoundsChanged.addListener((window) => {
  chrome.windows.get(loginPopupWindowId, (win) => {
    let changed = false;
    let updateInfo = {};

    if (win.width < 320) {
      updateInfo.width = 320;
      changed = true;
    }
    if (win.height < 420) {
      updateInfo.height = 420;
      changed = true;
    }

    if (changed) {
      chrome.windows.update(loginPopupWindowId, updateInfo);
    }
  });
});