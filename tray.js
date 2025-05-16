(function () {
    console.log("funcionou");

    // === Inserção de div com JavaScript puro ===
    const divPura = document.createElement("div");
    divPura.textContent = "Div adicionada com JavaScript puro";
    divPura.style.backgroundColor = "#cce5ff";
    divPura.style.padding = "10px";
    divPura.style.margin = "10px 0";
    divPura.style.display = "none";
    divPura.style.border = "1px solid #007bff";

    // Insere no body ou outro lugar se quiser
    document.body.appendChild(divPura);

    // === Inserção de div com jQuery (se disponível) ===
    if (typeof window.jQuery !== "undefined") {
        $("<div>")
            .text("Div adicionada com jQuery")
            .css({
                backgroundColor: "#d4edda",
                padding: "10px",
                display: "none",
                margin: "10px 0",
                border: "1px solid #28a745"
            })
            .appendTo("body");
    } else {
        console.warn("jQuery não está disponível.");
    }
})();
