function startCashback() {
    let amountEl = $('.valor-subtotal').data('subtotalValor');
    if (amountEl > 0 && $('.cupom-sucesso').length == 0) {
        renderCashbackUI(amountEl)
    }
}

function createSpinner() {
    return '<style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style><div id="k-preloader" style="border:4px solid #f3f3f3;border-top:4px solid #333;border-radius:50%;width:30px;height:30px;animation:spin 1s linear infinite;margin:20px auto;"></div>'
}

function requestCashback(doc, amountEl, type, onSuccess, onFail) {
    onSuccess = typeof onSuccess === "function" ? onSuccess : function () {};
    onFail = typeof onFail === "function" ? onFail : function () {};
    $.post("https://n8n-integrations.kiskadi.com/webhook/loja-integrada/sublitex", {
        document: doc,
        amount: amountEl,
        type: type
    }, r => {
        r.success ? onSuccess(r) : onFail(r)
    }).fail((f) => {
        onFail(f.responseJSON.message ?? "Houve um erro ao tentar resgatar o cashback.")
    })
}

function renderCashbackUI(amountEl) {
    var markup = '<tr class="bg-dark" id="k-container" ><td colspan="3"><div class="form-horizontal"><div class="control-group"><label class="control-label" for="kDocument"><b class="">Cashback:</b></label><div class="controls text-left"><div class="input-append"><input type="text" name="k_document" id="kDocument" class="input-small" placeholder="Seu CPF"><input type="hidden" name="k_amount" id="kAmount" class="input-small" value="0,00" disabled><button class="btn" id="checkCashback">Consultar</button><button class="btn hidden" id="redeemCashback">Resgatar</button></div></div></div></div></td><td colspan="3"></td></tr>';
    $(markup).insertAfter($('table.tabela-carrinho tr.bg-dark').eq(2));

    $('#checkCashback').click(function () {
        $(this).prop("disabled", true);
        var doc = $('#kDocument').val().replace(/\D/g, "");
        if(doc.length === 11){
            requestCashback(doc, amountEl, "consulta", r => {
                showBalanceCheckUI(r, doc, amountEl)
            }, err => {
                // $('#k-preloader').remove();
                // $('#k-container').append('<span style="display: flex; justify-content: center; padding: 10px;">' + err + "</span>");
            })
        }else{
            $('#k-preloader').remove()
            $('#k-msg').html("Por favor insira um CPF válido.")
        }
        $('#checkCashback').prop("disabled", false);
    })
}

function showBalanceCheckUI(response, doc, amountEl) {
    $('#kDocument').prop('type', 'hidden')
    $('#kAmount').prop('type', 'text').val(response.discount.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}))
    $('#checkCashback').addClass('hidden')
    $('#redeemCashback').removeClass('hidden').click(function () {
        // $('#k-container').append(createSpinner());
        requestCashback(doc, amountEl, "resgate", r => {
            $('#usarCupom').val(r.coupon);
            $('#btn-cupom').click();
        }, err => {
            // $('#k-preloader').remove();
            // $('#k-container').append('<span style="display: flex; justify-content: center; padding: 10px;">' + err + "</span>")
        })
    })
}
startCashback()