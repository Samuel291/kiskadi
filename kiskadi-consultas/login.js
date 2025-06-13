(async () => {

    async function carregarHTML(path) {
        chrome.runtime.sendMessage({ abrirPopup: path });
    }

    async function mostrarLogin() {
        await carregarHTML('login.html');
    }

    async function mostrarModal() {
        await carregarHTML('modal.html');
    }
    document.getElementById('sigin')?.addEventListener('click', () => {
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
                    if (res.status == 200) {
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

    function cleanForm() {
        $('#exchange').prop("disabled", true);
        $('#clean').prop("disabled", true);
        $('#balance').text('0,00')
        $('#k-document').val('')
        $('.cashback-title small strong').text('Consulte o CPF para verificar o saldo')
    }
    document.getElementById('sigout')?.addEventListener('click', () => {
        document.getElementsByClassName('content')[0].style.display = 'block';
        document.getElementsByClassName('preloader')[0].style.display = 'none';
        localStorage.setItem('isLogedIn', 'false');
        mostrarLogin();
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
                if(discount > 0.00) {
                    localStorage.setItem('amountDiscount', discount.toFixed(2));
                    $('#balance').text(localStorage.getItem('amountDiscount').replace('.', ','))
                    $('#exchange').removeAttr('disabled')
                    $('#clean').removeAttr('disable d')
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
})();