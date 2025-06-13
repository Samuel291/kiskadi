(async () => {
    async function carregarHTML(path) {
        chrome.runtime.sendMessage({ abrirPopup: path });
    }

    async function mostrarLogin() {
        await carregarHTML('login.html');
    }

    async function mostrarModal() {
        await carregarHTML('modal.html');
    }

    if(localStorage.getItem('isLogedIn') === 'true'){
        mostrarModal()
    }else{
        mostrarLogin()
    }
})();