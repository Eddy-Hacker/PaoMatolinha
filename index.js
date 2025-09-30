function adicionarCliente() {
    let nome = document.getElementById("nome").value;
    let quantidade = document.getElementById("quantidade").value;
    let tipoVenda = document.getElementById("tipoVenda").value;

    if (nome && quantidade && tipoVenda) {
        fetch('http://localhost:3000/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                quantidade,
                tipoVenda,
            })
        })
        .then(response => response.json())
        .then(data => {
            alert('Cliente adicionado com sucesso');
            document.getElementById("clienteForm").reset();
        })
        .catch(error => {
            console.error('Erro ao adicionar cliente:', error);
            alert('Erro ao adicionar');
        });
    } else {
        alert("Preencha todos os campos!");
    }

}

