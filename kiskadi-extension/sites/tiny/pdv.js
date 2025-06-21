export function listenSearchCashback() {
    let consumerDocBuffer = $('#divDadosCliente').text().replace(/\D/g, '');
    const observerDocument = new MutationObserver((mutationsList) => {
        let consumerDoc = $('#divDadosCliente').text().replace(/\D/g, '');
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                let saleAmount = $('#divTotal').text().replace(/\D/g, '') / 100;
                saleAmount = (saleAmount > 0) ? saleAmount : 99999;
                if (consumerDoc && consumerDoc !== consumerDocBuffer) {
                    consumerDocBuffer = consumerDoc
                    $('#k-document').val(consumerDoc)
                    $('#k-amount').val(saleAmount)
                    $('#search-cashback').click()
                    break;
                }
            }
        }
    });

    observerDocument.observe($('#divDadosCliente')[0], {
        childList: true,
        characterData: true,
        subtree: false
    });

    // Faz uma nova consulta de saldo de cahsback quando usuário segue para pagamento
    $('button.btnSalvarVendaParaDepois').eq(0).prev().on('click', function (e) {
        let saleAmount = $('#divTotal').text().replace(/\D/g, '') / 100;
        if ($('#k-document').val()) {
            $('#k-amount').val(saleAmount)
            $('#search-cashback').click()
        }
    });
}
export function listenApplyDiscount(){
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

export function listenRedeemCashback(widget, kDocument){
    // Verifica se está na última etapa da venda para poder efetuar a troca no Kisakdi
    $('#btnSalvarVendaRapida').one('click', () => {
        if ($('.forma-pagamento-section').length) {
            widget.kRedeemCashback(kDocument)
        }
    });
    // Verifica se foi clicado para gerar um pagamento para escutar o botão finalizar venda
    $('#btnGerarPagamentoCobrancasPdv').one('click', () => {
        $('#bs-modal').one('click', '.modal-footer button', function () {
            if ($(this).text().toLowerCase().includes('finalizar venda')) {
                widget.kRedeemCashback(kDocument)
            }
        });
    });
}