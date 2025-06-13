(async () => {
    const EXISTING = document.getElementById('kiskadi-widget');
    let addExchangeListener = true;
    if (EXISTING) {
        EXISTING.remove();
        return;
    }

    // Cria o container raiz do popup
    const kwidget = document.createElement('div');
    kwidget.id = 'kiskadi-widget';
    kwidget.style.position = 'fixed';
    kwidget.style.top = '100px';
    kwidget.style.right = '20px';
    kwidget.style.zIndex = '999999';

    document.body.appendChild(kwidget);
    // Lógica de arrastar
    let isDragging = false, offsetX = 0, offsetY = 0;
    kwidget.addEventListener('mousedown', e => {
        isDragging = true;
        offsetX = e.clientX - kwidget.offsetLeft;
        offsetY = e.clientY - kwidget.offsetTop;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        kwidget.style.left = `${e.clientX - offsetX}px`;
        kwidget.style.top = `${e.clientY - offsetY}px`;
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            localStorage.setItem('kwidget-left', kwidget.style.left);
            localStorage.setItem('kwidget-top', kwidget.style.top);
        }
        isDragging = false;
        document.body.style.userSelect = '';
    });

    async function carregarHTML(path) {
        const url = chrome.runtime.getURL(path);
        const resp = await fetch(url);
        const html = await resp.text();
        kwidget.innerHTML = html;
    }

    // Lógica de login
    async function mostrarLogin() {
        await carregarHTML('login.html');

        document.getElementById('sigin')?.addEventListener('click', () => {
            console.log('clicou');
            const cnpj = $('#k-cnpj').val();
            const user = $('#k-user').val();
            const password = $('#k-password').val();
            document.getElementsByClassName('content')[0].style.display = 'none';
            document.getElementsByClassName('preloader')[0].style.display = 'block';

            if (cnpj && user && password) {
                const token = btoa(user + ':' + password)
                fetch('https://api.kiskadi.com/api/v2/branches', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(res => {
                        if (res.status === 200) {
                            loadRequest(true)
                            localStorage.setItem('token', token)
                            localStorage.setItem('branch_cnpj', cnpj)
                            mostrarModal()
                        } else {
                            loadRequest(false, 'Houve um erro ao tentar autenticar.')
                        }
                    })
                    .catch(error => {
                        loadRequest(false, 'Houve um erro ao tentar autenticar.')
                    });
            } else {
                loadRequest(false, 'Houve um erro ao tentar autenticar.')
            }
        });
    }

    function loadRequest(isLogedIn, message) {
        document.getElementsByClassName('content')[0].style.display = 'block';
        document.getElementsByClassName('preloader')[0].style.display = 'none';
        if(isLogedIn !== undefined) {
            localStorage.setItem('isLogedIn', isLogedIn ? 'true' : 'false');
        }
        if (message) {
            alert(message);
        }
    }

    /**
     * Limpa os dados para uma nova consulta
     */
    function cleanForm() {
        $('#exchange').prop("disabled", true);
        $('#clean').prop("disabled", true);
        $('#balance').text('0,00')
        $('#balance_total').text('0,00')
        $('#k-document').val('')
        $('.cashback-title small strong').text('Consulte o CPF para verificar o saldo')
    }
    async function mostrarModal() {
        await carregarHTML('modal.html');
        document.getElementById('sigout')?.addEventListener('click', () => {
            document.getElementsByClassName('content')[0].style.display = 'block';
            document.getElementsByClassName('preloader')[0].style.display = 'none';
            localStorage.setItem('isLogedIn', 'false');
            mostrarLogin();
        });
        $('button.btnSalvarVendaParaDepois').eq(0).prev().on('click',function(e) {
            let saleAmount = $('#divTotal').text().replace(/\D/g, '')/100;
            if ($('#k-document').val()) {
                $('#k-amount').val(saleAmount)
                $('#search-cashback').click()
            }
        });
        document.getElementById('search-cashback')?.addEventListener('click', () => {
            document.getElementsByClassName('content')[0].style.display = 'none';
            document.getElementsByClassName('preloader')[0].style.display = 'block';
            fetch('https://api.kiskadi.com/api/v2/consumers/exchangeable_points?branch_cnpj=' +
                localStorage.getItem('branch_cnpj') +'&cpf=' + $('#k-document').val() +'&order_value=' + $('#k-amount').val(), {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('houve um erro ao consultar o saldo');
                    } else {
                        return res.json();
                    }
                })
                .then(data => {
                    var discount = parseFloat(data.available_discount);
                    var discountTotal = parseFloat(data.total_currency_balance);
                    if(discount > 0.00) {
                        localStorage.setItem('amountDiscount', discount.toFixed(2));
                        $('#balance').text(localStorage.getItem('amountDiscount').replace('.', ','))
                        $('#balance_total').text(discountTotal.toFixed(2).replace('.', ','))
                        if($('#k-amount').val() > 0 && $('#k-amount').val() != 99999) {
                            $('#exchange').removeAttr('disabled')
                        }
                        $('#clean').removeAttr('disabled')
                    }
                    $('.cashback-title small strong').text(data.consumer_name)
                    loadRequest()
                })
                .catch(err => {
                    console.log(err)
                    loadRequest(undefined, 'Houve um erro ao tentar consultar o saldo desse cliente.')
                });
        });
        document.getElementById('clean')?.addEventListener('click', () => {
            cleanForm()
        });
        document.getElementById('exchange')?.addEventListener('click', () => {
            amountDiscount = localStorage.getItem('amountDiscount')
            var discountAmount = 0.00;
            var inputDiscount = $("input[name='desconto']");
            var discountValue = inputDiscount.val().trim(); // remove espaços em branco

            if (discountValue.includes("%")) {
                discountAmount = $('#k-amount').val() * (parseFloat(discountValue) / 100);
            } else {
                discountAmount = parseFloat(discountValue.replace(",", "."));;
            }

            discountAmount = discountAmount + parseFloat(amountDiscount);
            inputDiscount.val(discountAmount.toFixed(2).replace('.', ','));
            inputDiscount[0].dispatchEvent(new Event('blur'));

            // Armazena o documento para efetuar o resgate
            let buffDocument = $('#k-document').val();

            cleanForm()

            // Verifica se está na última etapa da venda para poder efetuar a troca no Kisakdi
            document.getElementById('btnSalvarVendaRapida')?.addEventListener('click', () => {
                if($('.forma-pagamento-section').length) {
                    fetch('https://api.kiskadi.com/api/v2/transactions/exchange', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            force_drop: true,
                            currency_used: localStorage.getItem('amountDiscount'),
                            branch_cnpj: localStorage.getItem('branch_cnpj'),
                            consumer: {
                                cpf: buffDocument
                            },
                            labels: ["Resgate via Tiny PDV"]
                        })
                    })
                    .then(res => res.text())
                    .then(data => console.log('Webhook enviado:', data))
                    .catch(err => console.log('Erro ao enviar:', err))
                    .finally(() => {
                        document.getElementById('k-document').value = '';
                    });
                }
            });
        });
    }

    if(localStorage.getItem('isLogedIn') === 'true'){
        mostrarModal()
    }else{
        mostrarLogin()
    }
})();