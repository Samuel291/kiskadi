(function() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const urlParams = new URL(currentScript.src).searchParams;

    const usuarioId = urlParams.get('usuarioId');
    const plano = urlParams.get('plano');

    console.log(usuarioId, plano);
})();
