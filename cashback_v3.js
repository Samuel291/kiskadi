(function () {
    const el = document.querySelector('#customer-cpf');

    let currentValue = el.value;

    Object.defineProperty(el, 'value', {
        get() {
            return currentValue;
        },
        set(val) {
            console.log('Interceptado! Novo valor:', val);
            currentValue = val;
        }
    });
})();
