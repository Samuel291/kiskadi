(async () => {
    const URL = window.location.href;
    const KWIDGET = document.createElement('div');
    const EXISTING = document.getElementById('kiskadi-widget');
    let label = '';

    if (EXISTING) {
        EXISTING.remove();
    } else {
        // Cria o container raiz do popup
        KWIDGET.id = 'kiskadi-widget';
        KWIDGET.style.position = 'fixed';
        KWIDGET.style.top = '100px';
        KWIDGET.style.right = '20px';
        KWIDGET.style.zIndex = '999999';
        document.body.appendChild(KWIDGET);
        moveWidget(KWIDGET)
    }

    /**
     * Função que permite que o widget seja arrastado
     * @param element
     */
    function moveWidget(element) {
        let isDragging = false, offsetX = 0, offsetY = 0;
        element.addEventListener('mousedown', e => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                localStorage.setItem('kwidget-left', element.style.left);
                localStorage.setItem('kwidget-top', element.style.top);
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
    async function loadPath(path) {
        const url = chrome.runtime.getURL(path);
        const resp = await fetch(url);
        KWIDGET.innerHTML = await resp.text();
    }

    /**
     * Função para mostrar o popup da area de login
     * @returns {Promise<void>}
     */
    async function showLogin() {
        await loadPath('login.html');

        document.getElementById('k-sigin')?.addEventListener('click', () => {
            console.log('clicou');
            const cnpj = $('#k-cnpj').val();
            const user = $('#k-user').val();
            const password = $('#k-password').val();

            kTooglePreload(true)

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
                            kLoadRequest(true)
                            localStorage.setItem('token', token)
                            localStorage.setItem('branch_cnpj', cnpj)
                            showInterface()
                        } else {
                            kLoadRequest(false, 'Houve um erro ao tentar autenticar.')
                        }
                    })
                    .catch(error => {
                        kLoadRequest(false, 'Houve um erro ao tentar autenticar.')
                    });
            } else {
                kLoadRequest(false, 'Houve um erro ao tentar autenticar.')
            }
        });
    }

    /**
     * Função para mostrar o popup da area logada
     * @returns {Promise<void>}
     */
    async function showInterface() {
        await loadPath('modal.html');

        let ERP = ''
        if (URL.includes('tiny.com.br/pdv')) {
            ERP = await import(chrome.runtime.getURL('sites/tiny/pdv.js'));
            ERP.listenSearchCashback()
            label = 'Tiny PDV';
        }else if (URL.includes('tiny.com.br/vendas')) {
            ERP = await import(chrome.runtime.getURL('sites/tiny/vendas.js'));
            ERP.listenSearchCashback()
            label = 'Tiny Pedido de Venda';
        }

        $('#search-cashback').on('click', () => {
            kTooglePreload(true)
            let kSaleAmount = ($('#k-amount').val() > 0)? $('#k-amount').val() : 99999;
            let kDocument = $('#k-document').val();
            if(kDocument) {
                fetch('https://api.kiskadi.com/api/v2/consumers/exchangeable_points?branch_cnpj=' +
                    localStorage.getItem('branch_cnpj') + '&cpf=' + $('#k-document').val() + '&order_value=' + kSaleAmount, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(res => {
                        if (!res.ok) {
                            return res.json().then(body => {
                                if (body.errors && body.errors[0] === 'Consumer not found') {
                                    $('.cashback-title small strong').text('Consumidor não cadastrado!');
                                    return;
                                } else {
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
                        if (discount >= 0.00) {
                            localStorage.setItem('amountDiscount', discount.toFixed(2));
                            $('#k-balance').text(localStorage.getItem('amountDiscount').replace('.', ','))
                            $('#k-balance_total').text(discountTotal.toFixed(2).replace('.', ','))
                            if ($('#k-amount').val() > 0 && $('#k-amount').val() != 99999 && discount > 0) {
                                $('#k-exchange').removeAttr('disabled')
                            }
                            $('#k-clean').removeAttr('disabled')
                        }
                        $('.cashback-title small strong').text(data.consumer_name)
                        kLoadRequest()
                    })
                    .catch(err => {
                        kCleanCashbackFields(false)
                        kLoadRequest(undefined, 'Houve um erro ao tentar consultar o saldo desse cliente.', false)
                    });
            }
        });
        $('#k-clean').on('click', () => {
            kCleanCashbackFields()
        });
        $('#k-exchange').on('click', () => {
            var bufferDocument = $('#k-document').val();
            ERP.listenApplyDiscount()
            kCleanCashbackFields()
            ERP.listenRedeemCashback({kRedeemCashback}, bufferDocument)
        });
    }


    function kRedeemCashback(kdocument) {
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
                    cpf: kdocument
                },
                labels: ["Resgate via "+ label]
            })
        })
            .then(res => res.text())
            .catch(err => console.log('Erro ao enviar:', err))
            .finally(() => {
                $('#k-document').val('');
            });
    }

    /**
     * Função para alternar visualização do conteúdo e do preload
     * @param show
     */
    function kTooglePreload(show) {
        if (show === true) {
            document.getElementsByClassName('k-content')[0].style.display = 'none';
            document.getElementsByClassName('k-preloader')[0].style.display = 'block';
        } else {
            document.getElementsByClassName('k-content')[0].style.display = 'block';
            document.getElementsByClassName('k-preloader')[0].style.display = 'none';
        }
    }

    function kLoadRequest(isLogedIn, message, showMessage = true) {
        kTooglePreload(false)
        if (isLogedIn !== undefined) {
            localStorage.setItem('isLogedIn', isLogedIn ? 'true' : 'false');
        }
        if (message && showMessage) {
            alert(message);
        }
    }

    /**
     * Limpa os dados para uma nova consulta
     */
    function kCleanCashbackFields(modifyTitle = true) {
        $('#k-exchange').prop("disabled", true);
        $('#k-clean').prop("disabled", true);
        $('#k-balance').text('0,00')
        $('#k-balance_total').text('0,00')
        if (modifyTitle) {
            $('#k-document').val('')
            $('.cashback-title small strong').text('Consulte o CPF para verificar o saldo')
        }
    }

    /**
     * Valida se o usuário está logado para decidir qual tela mostrar
     */
    (localStorage.getItem('isLogedIn') === 'true') ? showInterface() : showLogin();
})();