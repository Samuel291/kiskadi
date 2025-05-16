(function () {
    const scripts = document.getElementsByTagName('cashback');
    const currentScript = scripts[scripts.length - 1];

    // Pegando atributos data-*
    const usuarioId = currentScript.getAttribute('data-usuario-id');
    const plano = currentScript.getAttribute('data-plano');

    console.log("Usuário ID:", usuarioId);
    console.log("Plano:", plano);

    // Exemplo: mostrar em alert
    alert(`Bem-vindo, usuário ${usuarioId} com plano ${plano}!`);
})();