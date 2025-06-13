$(document).ready(function () {
    // Detecta a URL
    const url = window.location.href;

    if (url.includes("app.tiny.com.br/vendas") || url.includes("erp.tiny.com.br/vendas")) {
    } else if (url.includes("app.tiny.com.br/pdv") || url.includes("erp.tiny.com.br/pdv")) {

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    let consumerDoc = $('#divDadosCliente').text().replace(/\D/g, '');
                    let saleAmount = $('#divTotal').text().replace(/\D/g, '')/100;
                    saleAmount = (saleAmount > 0)? saleAmount : 99999;
                    if (consumerDoc) {
                        $('#k-document').val(consumerDoc)
                        $('#k-amount').val(saleAmount)
                        $('#search-cashback').click()
                        break;
                    }
                }
            }
        });

        observer.observe($('#divDadosCliente')[0], {
            childList: true,
            characterData: true,
            subtree: false
        });
    }
});