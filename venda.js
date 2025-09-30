const form = document.getElementById("formVenda");

form.addEventListener("submit", function(e){
    e.preventDefault();

    let cliente = document.getElementById("cliente").value;
    let quantidade = parseInt(document.getElementById("quantidade").value);
    let preco = parseFloat(document.getElementById("preco").value);
    let total = quantidade * preco;

    const venda = { cliente, quantidade, preco, total };

    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendas.push(venda);
    localStorage.setItem("vendas", JSON.stringify(vendas));

    alert("Venda registrada com sucesso!");
    form.reset();
});
