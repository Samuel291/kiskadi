window.onload = function () {
    const modalPayment = document.querySelector('div[data-loading="modal-payment"]');
    if (modalPayment) {
        const observer = new MutationObserver((mutationsList) => {
            if (modalPayment.classList.contains("hidden")) {
                observer.disconnect();
                kcheck($('#customer-cpf').val())
            }
        });

        observer.observe(modalPayment, {
            attributes: true, // observar mudanças de atributos
            attributeFilter: ["class"], // só observar mudanças na classe
        });
    }

    function kcheck(kdocument) {
        var amount = $('span[data-bind="money: checkout.subtotal"]').eq(0);
        var message = 'O cashback será resgatado como um cupom de desconto que será aplicado automaticamnete, não sendo cumulativo com outros cupons.';
        if (kdocument && amount.length) {
            if(kdocument.length <= 10) {
                kreq(kdocument, amount, 'consulta', function (s) {
                    $('<div class="ch-payment-group active selected" style="margin-top: 10px;" id="k-container">\n' +
                        '    <div class="ch-payment-group-header ch-flex" data-toggle="#k-content">\n' +
                        '        <div>\n' +
                        '            <svg class="ch-icon">\n' +
                        '                <use xlink:href="#ch-icon-others"></use>\n' +
                        '            </svg>\n' +
                        '            <strong>Aproveite seu cashback</strong>\n' +
                        '        </div>\n' +
                        '        <div class="ch-payment-group-header-plots">\n' +
                        '            <span id="k-saldo"></span>\n' +
                        '        </div>\n' +
                        '    </div>\n' +
                        '    <div id="k-content" class="ch-payment-group-content" style="display: block">\n' +
                        '        <p class="ch-vspace-md">\n' + message +
                        '        </p>\n' +
                        '        <div class="ch-vspace-sm">\n' +
                        '            <button type="button" id="resgataCashback" class="btn-next-step">Resgatar</button>\n' +
                        '        </div>\n' +
                        '    </div>\n' +
                        '</div>').insertBefore('#coupon hr');
                    $('#k-saldo').text(s.discount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }))
                    $('#resgataCashback').click(function () {
                        $('#k-container').append('<style>@keyframes girar {' +
                            '0% { transform: rotate(0deg); }' +
                            '100% { transform: rotate(360deg); }}</span>');
                        $('#k-container').append('<div id="k-preloader" style="border: 4px solid #f3f3f3; ' +
                            'border-top: 4px solid #333; ' +
                            'border-radius: 50%; ' +
                            'width: 30px; ' +
                            'height: 30px;' +
                            'animation: girar 1s linear infinite;' +
                            'margin: 20px auto;"></div>');
                        kreq(kdocument, amount, 'resgate', function (y) {
                            $('input[name="coupon-identifier"]').val(y.coupon);
                            $('#coupon .link').click();
                            $('input[name="coupon-identifier"]')[0].dispatchEvent(new Event('input', {bubbles: true}));
                            $('#k-container').remove()
                            $('#validate-coupon-btn').click()
                        }, function (f) {
                            $('#k-preloader').remove()
                            $('#k-container').append('<span style=" display: flex; justify-content: center; padding: 10px 0;' + f + '</span>')
                        })
                    })
                })
            }
            else{
                $('<div class="ch-payment-group active selected" style="margin-top: 10px;" id="k-container">\n' +
                    '    <div class="ch-payment-group-header ch-flex" data-toggle="#k-content">\n' +
                    '        <div>\n' +
                    '            <svg class="ch-icon">\n' +
                    '                <use xlink:href="#ch-icon-others"></use>\n' +
                    '            </svg>\n' +
                    '            <strong>Consulte seu saldo de cashback</strong>\n' +
                    '        </div>\n' +
                    '        <div class="ch-payment-group-header-plots">\n' +
                    '            <span id="k-saldo"></span>\n' +
                    '        </div>\n' +
                    '    </div>\n' +
                    '    <div id="k-content" class="ch-payment-group-content" style="display: block">\n' +
                    '        <div class="ch-vspace-sm">\n' +
                    '    <div class="ch-input-group ch-no-margin">' +
                    '       <input type="text" id="k-document" name="cashback-identifier" class="ch-input" type="tel" ' +
                    '       data-mask="00000000000" maxlength="11">' +
                    '           <label for="cashback-identifier" class="ch-label">' +
                    '               <span class="ch-label-content">Insira seu CPF</span>' +
                    '           </label>' +
                    '    </div>' +
                    '   <button type="button" id="consultarCashback" class="btn-next-step">Consultar</button>\n' +
                    '        </div>' +
                    '    </div>' +
                    '<span id="k-msg"></span>'+
                    '</div>').insertBefore('#coupon hr');
                $('#consultarCashback').click(function () {
                    $('#k-msg').html('');
                    $('#consultarCashback').prop('disabled', true);
                    $('#k-container').append('<style>@keyframes girar {' +
                        '0% { transform: rotate(0deg); }' +
                        '100% { transform: rotate(360deg); }}</span>');
                    $('#k-container').append('<div id="k-preloader" style="border: 4px solid #f3f3f3; ' +
                        'border-top: 4px solid #333; ' +
                        'border-radius: 50%; ' +
                        'width: 30px; ' +
                        'height: 30px;' +
                        'animation: girar 1s linear infinite;' +
                        'margin: 20px auto;"></div>');
                    kdocument = $('#k-document').replace(/\D/g, '');
                    if(kdocument.length === 11) {
                        kreq(kdocument, amount, 'consulta', function (s) {
                            $('#k-container').remove();
                            $('<div class="ch-payment-group active selected" style="margin-top: 10px;" id="k-container">\n' +
                                '    <div class="ch-payment-group-header ch-flex" data-toggle="#k-content">\n' +
                                '        <div>\n' +
                                '            <svg class="ch-icon">\n' +
                                '                <use xlink:href="#ch-icon-others"></use>\n' +
                                '            </svg>\n' +
                                '            <strong>Aproveite seu cashback</strong>\n' +
                                '        </div>\n' +
                                '        <div class="ch-payment-group-header-plots">\n' +
                                '            <span id="k-saldo"></span>\n' +
                                '        </div>\n' +
                                '    </div>\n' +
                                '    <div id="k-content" class="ch-payment-group-content" style="display: block">\n' +
                                '        <p class="ch-vspace-md">\n' + message +
                                '        </p>\n' +
                                '        <div class="ch-vspace-sm">\n' +
                                '            <button type="button" id="resgataCashback" class="btn-next-step">Resgatar</button>\n' +
                                '        </div>\n' +
                                '    </div>\n' +
                                '</div>').insertBefore('#coupon hr');
                            $('#k-saldo').text(s.discount.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }))
                            $('#resgataCashback').click(function () {
                                $('#k-container').append('<style>@keyframes girar {' +
                                    '0% { transform: rotate(0deg); }' +
                                    '100% { transform: rotate(360deg); }}</span>');
                                $('#k-container').append('<div id="k-preloader" style="border: 4px solid #f3f3f3; ' +
                                    'border-top: 4px solid #333; ' +
                                    'border-radius: 50%; ' +
                                    'width: 30px; ' +
                                    'height: 30px;' +
                                    'animation: girar 1s linear infinite;' +
                                    'margin: 20px auto;"></div>');
                                kreq(kdocument, amount, 'resgate', function (y) {
                                    $('input[name="coupon-identifier"]').val(y.coupon);
                                    $('#coupon .link').click();
                                    $('input[name="coupon-identifier"]')[0].dispatchEvent(new Event('input', {bubbles: true}));
                                    $('#k-container').remove()
                                    $('#validate-coupon-btn').click()
                                }, function (f) {
                                    $('#k-preloader').remove()
                                    $('#k-container').append('<span style=" display: flex; justify-content: center; padding: 10px 0;' + f + '</span>')
                                })
                            })
                        })
                    }else{
                        $('#k-container #k-msg').html('<p>Por favor insira um CPF válido.</p>')
                    }
                })
            }
        }
    }
    function kreq(document, amount, t, s, f) {
        if (typeof s !== 'function') {
            s = function() {};
        }
        if (typeof f !== 'function') {
            f = function() {};
        }
        $.post(
            'https://n8n-integrations.kiskadi.com/webhook/tray/practory',
            {
                document: document,
                amount: amount.text().replace(/[^\d]/g, '') / 100,
                type: t
            },
            function (r){
                (r.success)? s(r) : f(r)
            })
            .fail(function() {
                f('Houve um erro ao tentar resgatar o cashback.');
            });
    }
};