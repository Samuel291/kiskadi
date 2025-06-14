(async () => {
    const kwidget = document.createElement('div');
    const EXISTING = document.getElementById('kiskadi-widget');
    let exchanged = false;
    if (EXISTING) {
        EXISTING.remove();
        return;
    }else{
        // Cria o container raiz do popup
        kwidget.id = 'kiskadi-widget';
        kwidget.style.position = 'fixed';
        kwidget.style.top = '100px';
        kwidget.style.right = '20px';
        kwidget.style.zIndex = '999999';
        document.body.appendChild(kwidget);
        moveWidget(kwidget)
    }

    /**
     * Função que permite que o widget seja arrastado
     * @param kwidget
     */
    function moveWidget(kwidget){
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
    }

    /**
     * Função que permite o carregamento de um HTML
     * @param path
     * @returns {Promise<void>}
     */
    async function carregarHTML(path , widget) {
        const url = chrome.runtime.getURL(path);
        const resp = await fetch(url);
        const html = await resp.text();
        widget.innerHTML = html;
    }

    /**
     * Função para mostrar o popup da area de login
     * @returns {Promise<void>}
     */
    async function mostrarLogin() {
        await carregarHTML('login.html', kwidget);

        document.getElementById('k-sigin')?.addEventListener('click', () => {
            console.log('clicou');
            const cnpj = $('#k-cnpj').val();
            const user = $('#k-user').val();
            const password = $('#k-password').val();

            tooglePreload(true)

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

    /**
     * Função para mostrar o popup da area logada
     * @returns {Promise<void>}
     */
    async function mostrarModal() {
        await carregarHTML('modal.html', kwidget);
        document.getElementById('k-sigout')?.addEventListener('click', () => {
            tooglePreload(false)
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

            tooglePreload(true)

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
                        return res.json().then(body  => {
                            if (body.errors && body.errors[0] === 'Consumer not found') {
                                $('.cashback-title small strong').text('Consumidor não cadastrado!');
                                $('.cashback-title small strong')[0].style.color = '#FF0000';
                                return;
                            }else {
                                throw new Error('houve um erro ao consultar o saldo');
                            }
                        });
                    } else {
                        return res.json();
                    }
                })
                .then(data => {
                    var discount = parseFloat(data.available_discount);
                    var discountTotal = parseFloat(data.total_currency_balance);
                    if(discount > 0.00) {
                        localStorage.setItem('amountDiscount', discount.toFixed(2));
                        $('#k-balance').text(localStorage.getItem('amountDiscount').replace('.', ','))
                        $('#k-balance_total').text(discountTotal.toFixed(2).replace('.', ','))
                        if($('#k-amount').val() > 0 && $('#k-amount').val() != 99999) {
                            $('#k-exchange').removeAttr('disabled')
                        }
                        $('#k-clean').removeAttr('disabled')
                    }
                    $('.cashback-title small strong').text(data.consumer_name)
                    loadRequest()
                })
                .catch(err => {
                    loadRequest(undefined, 'Houve um erro ao tentar consultar o saldo desse cliente.')
                });
        });
        document.getElementById('k-clean')?.addEventListener('click', () => {
            cleanForm()
        });
        document.getElementById('k-exchange')?.addEventListener('click', () => {
            amountDiscount = localStorage.getItem('amountDiscount')
            var discountAmount = 0.00;
            exchanged = true;
            var inputDiscount = $("input[name='desconto']");
            var discountValue = inputDiscount.val().trim(); // remove espaços em branco

            if (discountValue.includes("%")) {
                discountAmount = $('#k-amount').val() * (parseFloat(discountValue) / 100);
            } else {
                discountAmount = parseFloat(discountValue.replace(",", "."));
            }

            discountAmount = discountAmount + parseFloat(amountDiscount);
            inputDiscount.val(discountAmount.toFixed(2).replace('.', ','));
            inputDiscount[0].dispatchEvent(new Event('blur'));
        });


        // Verifica se está na última etapa da venda para poder efetuar a troca no Kisakdi
        document.getElementById('btnSalvarVendaRapida')?.addEventListener('click', () => {
            if($('.forma-pagamento-section').length && exchanged === true) {
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
                            cpf: $('#k-document').val()
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
                exchanged = false;
                cleanForm()
            }
        });
    }

    /**
     * Função para alternar visualização do conteúdo e do preload
     * @param show
     */
    function tooglePreload(show){
        if(show === true){
            document.getElementsByClassName('k-content')[0].style.display = 'none';
            document.getElementsByClassName('k-preloader')[0].style.display = 'block';
        }else{
            document.getElementsByClassName('k-content')[0].style.display = 'block';
            document.getElementsByClassName('k-preloader')[0].style.display = 'none';
        }
    }
    function loadRequest(isLogedIn, message) {
        tooglePreload(false)
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
        $('#k-exchange').prop("disabled", true);
        $('#k-clean').prop("disabled", true);
        $('#k-balance').text('0,00')
        $('#k-balance_total').text('0,00')
        $('#k-document').val('')
        $('.cashback-title small strong').text('Consulte o CPF para verificar o saldo')
    }

    /**
     * Valida se o usuário está logado para decidir qual tela mostrar
     */
    (localStorage.getItem('isLogedIn') === 'true')? mostrarModal() : mostrarLogin();
})();