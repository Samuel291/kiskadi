window.onload = function () {
    (function () {
        console.log('Script carregado');

        const el = document.querySelector('#customer-cpf');

        // Verifica se o elemento realmente existe antes de tentar adicionar os listeners
        if (el) {
            el.addEventListener('input', () => {
                console.log('Input mudou (input event):', el.value);
            });

            el.addEventListener('change', () => {
                console.log('Input mudou (change event):', el.value);
            });
        } else {
            console.warn('Elemento #customer-cpf não encontrado.');
        }

        console.log('Script inserido');
    })();
};
