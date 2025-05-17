(function () {
    var kdocument = $('#customer-cpf').val();
    var msg = 'nao deu tempo';
    if (!kdocument) {
        msg = 'achou CPF'
    }
    $("<div>")
        .text(msg)
        .css({
            backgroundColor: "#d4edda",
            padding: "10px",
            display: "none",
            margin: "10px 0",
            border: "1px solid #28a745"
        })
        .appendTo("body");
})();
