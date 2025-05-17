(function () {
    console.log('Script carregado');
    const el = document.querySelector('#customer-cpf');

    el.addEventListener('input', () => {
        console.log('Input mudou (input event):', el.value);
    });

    el.addEventListener('change', () => {
        console.log('Input mudou (change event):', el.value);
    });
    console.log('Script inserido');
})();
