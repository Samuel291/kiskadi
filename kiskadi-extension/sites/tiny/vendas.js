export function listenSearchCashback(widget) {
    let consumerDocBuffer = $('#cnpj').val().replace(/\D/g, '');
    const observerDocument = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            let consumerDoc = $('#cnpj').val().replace(/\D/g, '');
            let saleAmount = $('#divSubtotal').text().replace(/\D/g, '') / 100;
            saleAmount = (saleAmount > 0) ? saleAmount : 99999;
            if (consumerDoc && consumerDoc !== consumerDocBuffer) {
                consumerDocBuffer = consumerDoc
                $('#k-document').val(consumerDoc)
                $('#k-amount').val(saleAmount)
                $('#search-cashback').click()
                break;
            }
        }
    });

    observerDocument.observe($('#td_cnpj')[0], {
        childList: true,
        characterData: true,
        subtree: true
    });

    // Faz uma nova consulta de saldo de cahsback quando usuário segue para pagamento
    $('#pag_formaPagamento').on('change', function (e) {
        let saleAmount = $('#divTotal').val().replace(/\D/g, '') / 100;
        if ($('#k-document').val()) {
            $('#k-amount').val(saleAmount)
            $('#search-cashback').click()
        }else if(consumerDocBuffer){
            $('#k-document').val(consumerDocBuffer)
            $('#k-amount').val(saleAmount)
            $('#search-cashback').click()
        }
    });
}

export function listenApplyDiscount() {
    var amountDiscount = localStorage.getItem('amountDiscount')
    var inputDiscount = $("input[name='desconto']");
    var discountValue = inputDiscount.val().trim(); // remove espaços em branco
    let discountAmount = parseFloat(discountValue.replace(",", "."));
    if (discountValue.includes("%")) {
        discountAmount = $('#k-amount').val() * (parseFloat(discountValue) / 100);
    }

    discountAmount = discountAmount + parseFloat(amountDiscount);
    inputDiscount.val(discountAmount.toFixed(2).replace('.', ','));
    inputDiscount[0].dispatchEvent(new Event('blur'));
}

export function listenRedeemCashback(widget, bufferDocument) {
    // Verifica se está na última etapa da venda para poder efetuar a troca no Kisakdi
    $('#botaoSalvar').one('click', () => {
        widget.kRedeemCashback(bufferDocument)
    });
}