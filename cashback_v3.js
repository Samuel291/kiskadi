window.onload = function () {
    const modalPayment = document.querySelector('div[data-loading="modal-payment"]');
    if (modalPayment) {
        const observer = new MutationObserver(() => {
            if (modalPayment.classList.contains("hidden")) {
                observer.disconnect();
                processDocument($('#customer-cpf').val())
            }
        });
        observer.observe(modalPayment, {attributes: true, attributeFilter: ["class"]})
    }

    function processDocument(id) {
        let amountEl = $('span[data-bind="money: checkout.subtotal"]').first();
        let msg = "O cashback será resgatado como um cupom de desconto que será aplicado automaticamnete, não sendo cumulativo com outros cupons.";
        amountEl = amountEl.text().replace(/[^\d]/g, "") / 100;
        if (id && amountEl >= 200) {
            id = id.replace(/\D/g, "");
            id.length <= 10 ? requestCashback(id, amountEl, "consulta", r => {
                renderCashbackUI(r, id, amountEl, msg)
            }, err => {
                $('#k-preloader').remove();
                $('#k-container').append('<span style="display: flex; justify-content: center; padding: 10px;">' + err.message + "</span>")
            }) : showBalanceCheckUI(amountEl, msg)
        }
    }

    function createSpinner() {
        return '<style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style><div id="k-preloader" style="border:4px solid #f3f3f3;border-top:4px solid #333;border-radius:50%;width:30px;height:30px;animation:spin 1s linear infinite;margin:20px auto;"></div>'
    }

    function requestCashback(doc, amountEl, type, onSuccess, onFail) {
        onSuccess = typeof onSuccess === "function" ? onSuccess : function () {};
        onFail = typeof onFail === "function" ? onFail : function () {};
        $.post("https://n8n-integrations.kiskadi.com/webhook/tray/practory", {
            document: doc,
            amount: amountEl,
            type: type
        }, r => {
            r.success ? onSuccess(r) : onFail(r)
        }).fail((f) => {
            onFail(f.responseJSON.message ?? "Houve um erro ao tentar resgatar o cashback.")
        })
    }

    function renderCashbackUI(response, doc, amountEl, msg) {
        var markup = '<div class="ch-payment-group active selected" style="margin-top: 10px;" id="k-container"><div class="ch-payment-group-header ch-flex" data-toggle="#k-content"><div><svg class="ch-icon"><use xlink:href="#ch-icon-others"></use></svg><strong>Aproveite seu cashback</strong></div><div class="ch-payment-group-header-plots"><span id="k-saldo"></span></div></div><div id="k-content" class="ch-payment-group-content" style="display: block"><p class="ch-vspace-md">' + msg + '</p><div class="ch-vspace-sm"><button type="button" id="redeemCashback" class="btn-next-step">Resgatar</button></div></div></div>';
        $(markup).insertBefore("#coupon hr");
        $('#k-saldo').text(response.discount.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}));
        $('#redeemCashback').click(function () {
            $('#k-container').append(createSpinner());
            requestCashback(doc, amountEl, "resgate", r => {
                $('input[name="coupon-identifier"]').val(r.coupon);
                $('#coupon .link').click();
                $('input[name="coupon-identifier"]')[0].dispatchEvent(new Event("input", {bubbles: true}));
                $('#k-container').remove();
                $('#validate-coupon-btn').click()
            }, err => {
                $('#k-preloader').remove();
                $('#k-container').append('<span style="display: flex; justify-content: center; padding: 10px;">' + err + "</span>")
            })
        })
    }

    function showBalanceCheckUI(amountEl, msg) {
        var markup = '<div class="ch-payment-group active selected" style="margin-top: 10px;" id="k-container"><div class="ch-payment-group-header ch-flex" data-toggle="#k-content"><div><svg class="ch-icon"><use xlink:href="#ch-icon-others"></use></svg><strong>Consulte seu saldo de cashback</strong></div><div class="ch-payment-group-header-plots"><span id="k-saldo"></span></div></div><div id="k-content" class="ch-payment-group-content" style="display: block"><div class="ch-vspace-sm"><div class="ch-input-group ch-no-margin"><input type="text" id="k-document" name="cashback-identifier" class="ch-input" data-mask="00000000000" maxlength="11"><label for="cashback-identifier" class="ch-label"><span class="ch-label-content">Insira seu CPF</span></label></div><button type="button" id="checkCashback" class="btn-next-step">Consultar</button></div></div><span id="k-msg" style="display: flex; justify-content: center; padding: 10px;"></span></div>';
        $(markup).insertBefore("#coupon hr");
        $('#checkCashback').click(function () {
            $('#k-msg').html("");
            $(this).prop("disabled", true);
            $('#k-container').append(createSpinner());
            var doc = $('#k-document').val().replace(/\D/g, "");
            doc.length === 11 ? requestCashback(doc, amountEl, "consulta", r => {
                $('#k-container').remove();
                renderCashbackUI(r, doc, amountEl, msg)
            }, err => {
                $('#k-preloader').remove();
                $('#k-container').append('<span style="display: flex; justify-content: center; padding: 10px;">' + err + "</span>");
                $('#checkCashback').prop("disabled", false);
            }) : ($('#k-preloader').remove(), $('#k-msg').html("Por favor insira um CPF válido."), $('#checkCashback').prop("disabled", false))
        })
    }
};