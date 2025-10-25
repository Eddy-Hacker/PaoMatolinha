// Sistema de Gestão de Vendas
class SistemaVendas {
    constructor() {
        this.sistema = window.sistemaPadaria;
        this.vendaEditando = null;
        this.init();
    }

    init() {
        this.configurarAba();
        this.configurarFormulario();
        this.configurarCalculos();
        this.carregarVendasHoje();
    }

    configurarAba() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                this.mudarAba(tabId);
            });
        });
    }

    mudarAba(tabId) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        if (tabId === 'vendas-hoje') {
            this.carregarVendasHoje();
        } else if (tabId === 'nova-venda') {
            this.limparFormulario();
        }
    }

    configurarFormulario() {
        const form = document.getElementById('venda-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.vendaEditando) {
                this.atualizarVenda();
            } else {
                this.registrarVenda();
            }
        });
    }

    configurarCalculos() {
        const quantidade = document.getElementById('quantidade');
        const preco = document.getElementById('preco-unitario');

        const calcular = () => {
            const qtd = parseInt(quantidade.value) || 0;
            const valor = parseFloat(preco.value) || 0;
            const total = qtd * valor;

            document.getElementById('calc-quantidade').textContent = qtd;
            document.getElementById('calc-preco').textContent = `${valor.toFixed(2)} MZN`;
            document.getElementById('calc-total').innerHTML = `<strong>${total.toFixed(2)} MZN</strong>`;
        };

        quantidade.addEventListener('input', calcular);
        preco.addEventListener('input', calcular);

        // Calcular inicialmente
        calcular();
    }

    registrarVenda() {
        const venda = {
            cliente: document.getElementById('cliente-nome').value.trim(),
            quantidade: parseInt(document.getElementById('quantidade').value),
            precoUnitario: parseFloat(document.getElementById('preco-unitario').value),
            tipo: document.getElementById('tipo-venda').value,
            total: parseInt(document.getElementById('quantidade').value) * 
                   parseFloat(document.getElementById('preco-unitario').value)
        };

        // Validação
        if (!this.validarVenda(venda)) return;

        this.sistema.adicionarVenda(venda);
        this.limparFormulario();
        
        // Mudar para aba de vendas após 1 segundo
        setTimeout(() => {
            this.mudarAba('vendas-hoje');
        }, 1000);
    }

    atualizarVenda() {
        const vendaAtualizada = {
            cliente: document.getElementById('cliente-nome').value.trim(),
            quantidade: parseInt(document.getElementById('quantidade').value),
            precoUnitario: parseFloat(document.getElementById('preco-unitario').value),
            tipo: document.getElementById('tipo-venda').value
        };

        // Validação
        if (!this.validarVenda(vendaAtualizada)) return;

        if (this.sistema.editarVenda(this.vendaEditando.id, vendaAtualizada)) {
            this.vendaEditando = null;
            this.limparFormulario();
            
            // Mudar para aba de vendas após 1 segundo
            setTimeout(() => {
                this.mudarAba('vendas-hoje');
            }, 1000);
        }
    }

    validarVenda(venda) {
        if (!venda.cliente || !venda.quantidade || !venda.precoUnitario || !venda.tipo) {
            this.sistema.mostrarNotificacao('Preencha todos os campos!', 'error');
            return false;
        }

        if (venda.quantidade < 1) {
            this.sistema.mostrarNotificacao('A quantidade deve ser pelo menos 1!', 'error');
            return false;
        }

        if (venda.precoUnitario <= 0) {
            this.sistema.mostrarNotificacao('O preço unitário deve ser maior que zero!', 'error');
            return false;
        }

        return true;
    }

    carregarVendasHoje() {
        const container = document.getElementById('vendas-list');
        const vendasHoje = this.sistema.obterVendasDoDia();

        // Atualizar contador
        document.getElementById('vendas-count').textContent = vendasHoje.length;

        if (vendasHoje.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma venda registrada hoje</p>
                </div>
            `;
            this.atualizarTotais();
            return;
        }

        container.innerHTML = vendasHoje.map(venda => `
            <div class="venda-item slide-in">
                <div class="venda-info">
                    <h4>${venda.cliente}</h4>
                    <div class="venda-meta">
                        <span>${venda.quantidade} pães</span>
                        <span class="venda-type ${venda.tipo}">
                            ${this.sistema.formatarTipoVenda(venda.tipo)}
                        </span>
                        <span>${venda.precoUnitario.toFixed(2)} MZN/cada</span>
                    </div>
                </div>
                <div class="venda-actions">
                    <div class="venda-amount">${venda.total.toFixed(2)} MZN</div>
                    <div class="action-buttons">
                        ${venda.tipo === 'emprestimo' ? `
                            <button class="btn-action btn-paid" onclick="sistemaVendas.marcarComoPago('${venda.id}')" title="Marcar como pago">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn-action btn-edit" onclick="sistemaVendas.editarVenda('${venda.id}')" title="Editar venda">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="sistemaVendas.removerVenda('${venda.id}')" title="Remover venda">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.atualizarTotais();
    }

    editarVenda(id) {
        const venda = this.sistema.obterVendaPorId(id);
        if (venda) {
            this.vendaEditando = venda;
            
            // Preencher o formulário com os dados da venda
            document.getElementById('cliente-nome').value = venda.cliente;
            document.getElementById('quantidade').value = venda.quantidade;
            document.getElementById('preco-unitario').value = venda.precoUnitario;
            document.getElementById('tipo-venda').value = venda.tipo;
            
            // Atualizar cálculos
            this.configurarCalculos();
            
            // Mudar para aba de nova venda
            this.mudarAba('nova-venda');
            
            // Atualizar texto do botão
            const submitBtn = document.querySelector('#venda-form button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Venda';
            
            this.sistema.mostrarNotificacao('Editando venda de ' + venda.cliente, 'info');
        }
    }

    removerVenda(id) {
        if (this.sistema.removerVenda(id)) {
            this.carregarVendasHoje();
        }
    }

    marcarComoPago(id) {
        if (this.sistema.marcarComoPago(id)) {
            this.carregarVendasHoje();
        }
    }

    limparFormulario() {
        document.getElementById('venda-form').reset();
        document.getElementById('preco-unitario').value = '5.00'; // Reset para valor padrão
        
        // Resetar botão de submit
        const submitBtn = document.querySelector('#venda-form button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Registrar Venda';
        
        this.vendaEditando = null;
        this.configurarCalculos(); // Resetar cálculos
    }

    atualizarTotais() {
        const resumo = this.sistema.obterResumoDoDia();

        document.getElementById('total-paes-vendidos').textContent = resumo.totalPaesVendidos;
        document.getElementById('total-paes-emprestados').textContent = resumo.totalPaesEmprestados;
        document.getElementById('total-geral-paes').textContent = resumo.totalGeralPaes;
        document.getElementById('total-dinheiro-vendas').textContent = `${resumo.totalDinheiroVendas.toFixed(2)} MZN`;
        document.getElementById('total-dinheiro-emprestimos').textContent = `${resumo.totalDinheiroEmprestimos.toFixed(2)} MZN`;
        document.getElementById('total-geral-dinheiro').textContent = `${resumo.totalGeralDinheiro.toFixed(2)} MZN`;
    }
}

// Função global para exportar para WhatsApp
function exportarParaWhatsapp() {
    if (window.sistemaPadaria) {
        window.sistemaPadaria.enviarRelatorioWhatsapp();
    }
}

// Inicializar o sistema de vendas
document.addEventListener('DOMContentLoaded', () => {
    // Garantir que o sistema principal está carregado
    if (!window.sistemaPadaria) {
        window.sistemaPadaria = new SistemaPadaria();
    }
    window.sistemaVendas = new SistemaVendas();
});