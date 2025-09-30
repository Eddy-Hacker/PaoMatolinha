window.addEventListener("DOMContentLoaded", () => {
    const tabela = document.getElementById("tabelaVendas");
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    vendas.forEach(venda => {
        let linha = `
            <tr>
                <td>${venda.cliente}</td>
                <td>${venda.quantidade}</td>
                <td>${venda.preco.toFixed(2)} MZN</td>
                <td>${venda.total.toFixed(2)} MZN</td>
            </tr>
        `;
        tabela.innerHTML += linha;
    });
});
