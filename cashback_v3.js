(function () {
    const target = document.querySelector('#customer-cpf');
    // if (target) {
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                // if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                console.log('rodando por aqui')
                console.log($('#customer-cpf'))
                console.log($('#customer-cpf').val())
                console.log($('#customer-cpf').value)
                // }
            });
        });
    //
        observer.observe(target, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
            // attributeFilter: ['value'] // só observa o atributo value
        });
    //
    //     console.log('Observando mudanças no atributo value de #customer-cpf');
    // } else {
    //     console.warn('Elemento #customer-cpf não encontrado.');
    // }
})();
