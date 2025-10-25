// Sistema Principal do Pão Matolinha
class SistemaPadaria {
    constructor() {
        this.vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        this.init();
    }

    init() {
        this.atualizarData();
        this.carregarDashboard();
    }

    atualizarData() {
        const dataElement = document.getElementById('current-date');
        if (dataElement) {
            const hoje = new Date();
            dataElement.textContent = hoje.toLocaleDateString('pt-PT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    carregarDashboard() {
        this.atualizarEstatisticas();
        this.carregarVendasRecentes();
    }

    atualizarEstatisticas() {
        const hoje = new Date().toDateString();
        const vendasHoje = this.vendas.filter(venda => 
            new Date(venda.data).toDateString() === hoje
        );

        let totalVendas = 0;
        let vendasVista = 0;
        let totalEmprestimos = 0;

        vendasHoje.forEach(venda => {
            if (venda.tipo === 'vista') {
                vendasVista += venda.total;
            } else if (venda.tipo === 'emprestimo') {
                totalEmprestimos += venda.total;
            }
            totalVendas += venda.total;
        });

        // Atualizar elementos na página
        if (document.getElementById('total-vendas')) {
            document.getElementById('total-vendas').textContent = `${totalVendas.toFixed(2)} MZN`;
            document.getElementById('vendas-vista').textContent = `${vendasVista.toFixed(2)} MZN`;
            document.getElementById('total-emprestimos').textContent = `${totalEmprestimos.toFixed(2)} MZN`;
        }
    }

    carregarVendasRecentes() {
        const container = document.getElementById('recent-sales');
        if (!container) return;

        const vendasHoje = this.obterVendasDoDia();

        if (vendasHoje.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma venda registrada hoje</p>
                    <a href="vendas.html" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i>
                        Fazer Primeira Venda
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = vendasHoje.map(venda => `
            <div class="sale-item slide-in">
                <div class="sale-info">
                    <h4>${venda.cliente}</h4>
                    <p>${venda.quantidade} pães • ${this.formatarTipoVenda(venda.tipo)}</p>
                </div>
                <div class="sale-amount">${venda.total.toFixed(2)} MZN</div>
            </div>
        `).join('');
    }

    formatarTipoVenda(tipo) {
        const tipos = {
            'vista': 'À Vista',
            'emprestimo': 'Empréstimo',
            'pago': 'Dívida Paga'
        };
        return tipos[tipo] || tipo;
    }

    // Métodos para gerenciar dados
    adicionarVenda(venda) {
        venda.id = Date.now().toString();
        venda.data = new Date().toISOString();
        this.vendas.push(venda);
        this.salvarDados();
        this.mostrarNotificacao('Venda registrada com sucesso!', 'success');
        this.carregarDashboard();
    }

    editarVenda(id, vendaAtualizada) {
        const index = this.vendas.findIndex(v => v.id === id);
        if (index !== -1) {
            // Mantém o ID e data original, atualiza os outros campos
            this.vendas[index] = {
                ...this.vendas[index],
                ...vendaAtualizada,
                total: vendaAtualizada.quantidade * vendaAtualizada.precoUnitario
            };
            this.salvarDados();
            this.mostrarNotificacao('Venda atualizada com sucesso!', 'success');
            this.carregarDashboard();
            return true;
        }
        return false;
    }

    removerVenda(id) {
        const venda = this.vendas.find(v => v.id === id);
        if (venda && confirm(`Tem certeza que deseja remover a venda de ${venda.cliente}?`)) {
            this.vendas = this.vendas.filter(v => v.id !== id);
            this.salvarDados();
            this.mostrarNotificacao('Venda removida com sucesso!', 'success');
            this.carregarDashboard();
            return true;
        }
        return false;
    }

    marcarComoPago(id) {
        const venda = this.vendas.find(v => v.id === id);
        if (venda && venda.tipo === 'emprestimo') {
            venda.tipo = 'pago';
            this.salvarDados();
            this.mostrarNotificacao('Dívida marcada como paga!', 'success');
            this.carregarDashboard();
            return true;
        }
        return false;
    }

    obterVendaPorId(id) {
        return this.vendas.find(v => v.id === id);
    }

    obterVendasDoDia() {
        const hoje = new Date().toDateString();
        return this.vendas.filter(venda => 
            new Date(venda.data).toDateString() === hoje
        ).reverse(); // Mais recentes primeiro
    }

    obterResumoDoDia() {
        const vendasHoje = this.obterVendasDoDia();
        
        let totalPaesVendidos = 0;
        let totalPaesEmprestados = 0;
        let totalDinheiroVendas = 0;
        let totalDinheiroEmprestimos = 0;

        vendasHoje.forEach(venda => {
            if (venda.tipo === 'vista') {
                totalPaesVendidos += venda.quantidade;
                totalDinheiroVendas += venda.total;
            } else if (venda.tipo === 'emprestimo') {
                totalPaesEmprestados += venda.quantidade;
                totalDinheiroEmprestimos += venda.total;
            }
        });

        return {
            totalPaesVendidos,
            totalPaesEmprestados,
            totalGeralPaes: totalPaesVendidos + totalPaesEmprestados,
            totalDinheiroVendas,
            totalDinheiroEmprestimos,
            totalGeralDinheiro: totalDinheiroVendas + totalDinheiroEmprestimos
        };
    }

    salvarDados() {
        localStorage.setItem('vendas', JSON.stringify(this.vendas));
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(tipo)}"></i>
            <span>${mensagem}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(tipo) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[tipo] || 'info-circle';
    }

    enviarRelatorioWhatsapp() {
        const vendasHoje = this.obterVendasDoDia();
        const resumo = this.obterResumoDoDia();

        if (vendasHoje.length === 0) {
            this.mostrarNotificacao('Nenhuma venda registrada hoje!', 'warning');
            return;
        }

        let mensagem = `🍞 *RELATÓRIO DIÁRIO - PÃO MATOLINHA*\n`;
        mensagem += `📅 ${new Date().toLocaleDateString('pt-PT')}\n\n`;
        
        mensagem += `📊 *RESUMO DO DIA:*\n`;
        mensagem += `🍞 Pães Vendidos: ${resumo.totalPaesVendidos}\n`;
        mensagem += `📝 Pães Emprestados: ${resumo.totalPaesEmprestados}\n`;
        mensagem += `📦 Total de Pães: ${resumo.totalGeralPaes}\n`;
        mensagem += `💰 Dinheiro de Vendas: ${resumo.totalDinheiroVendas.toFixed(2)} MZN\n`;
        mensagem += `💳 Dinheiro de Empréstimos: ${resumo.totalDinheiroEmprestimos.toFixed(2)} MZN\n`;
        mensagem += `💎 Total Geral: ${resumo.totalGeralDinheiro.toFixed(2)} MZN\n\n`;
        
        mensagem += `📋 *DETALHES DAS VENDAS:*\n`;
        vendasHoje.forEach((venda, index) => {
            const tipoIcon = venda.tipo === 'vista' ? '💰' : venda.tipo === 'pago' ? '✅' : '📝';
            const status = venda.tipo === 'pago' ? ' (PAGO)' : '';
            mensagem += `${tipoIcon} ${venda.cliente} - ${venda.quantidade} pães - ${venda.total.toFixed(2)} MZN${status}\n`;
        });

        mensagem += `\n_Relatório gerado automaticamente pelo Sistema Pão Matolinha_`;

        const telefone = '+258858585872';
        const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    }
}

// Inicializar o sistema
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaPadaria = new SistemaPadaria();
});

// Função global para o botão do WhatsApp
function enviarRelatorioWhatsapp() {
    if (window.sistemaPadaria) {
        window.sistemaPadaria.enviarRelatorioWhatsapp();
    }
}