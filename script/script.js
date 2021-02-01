// Modal para adicionar novas entradas/saidas na tabela
const Modal = {
    // Abrir Modal
    open() {
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },

    // Fechar o Modal
    close() {
        // Remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

// Salvando as transações nos Cookies
const Storage = {
    // Pegando informações 
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    // Guardando informações 
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}

// Funcionalidade para adicionar/remover entradas de dados & calculo dos Cards
const Transaction = {
    /* 
        Objetos vindo diretamente do Cookie após o preenchimento do Formulário do Modal
        description: Form.description.value
        amount: Form.amount.value
        date: Form.date.value
    */ 
    all: Storage.get(),
    
    // Adicionando transação
    add(transaction) {
        Transaction.all.push(transaction);
        
        App.reload();
    },

    // Removendo transação
    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    // Somar as entradas
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },

    // Somar as saidas
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    // Total
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Buscando/substituindo os dados do HTML com os dados do JS
const DOM = {
    // Buscando tbody da tabela para ser o elemento pai
    transactionsContainer: document.querySelector('#data-table tbody'),

    // Adicionar a transação no HTML
    addTransaction(transaction, index) { 
        // Criando elemento TR na DOM
        const tr = document.createElement('tr');

        // Irá receber os td's do HTML da função innerHTMLTransaction
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);

        // Salvando index 
        tr.dataset.index = index;

        // Adicionando os elementos filhos
        DOM.transactionsContainer.appendChild(tr);
    },

    // Criando template HTML
    innerHTMLTransaction(transaction, index) {
        // Verificando qual classe que será usa no CSS
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

        // Buscando o valor no objeto que veio do cookie e formatando a moeda
        const amount = Utils.formatCurrency(transaction.amount);

        // Criando template dos td's do HTML via JS
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `;
        return html;
    },

    // Atualizando os dados dos cards do HTML via JS
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    // Limpando transação anterior
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
}

// Formatações
const Utils = {
    // Formatando os dados do Modal 
    formatAmount(value) {
        // Transformando value em numero, multiplicando por 100 para usar 2 casas decimais 
        // Expressão regular para remover virgulas e pontos do número
        value = Number(value.replace(/\,\./g, '')) * 100;
        return value;
    },

    // Formatando a data e colocando no padrão do Brasil
    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // Formatando o numero e o tipo de moeda
    formatCurrency(value) {
        // Criando uma variavel para armazenar o sinal
        const signal = Number(value) < 0 ? '-' : '';

        /* 
            Transformando value em string e utilzando expressão regular
            para armazenar somente os numeros e removendo sinal caso exista.
        */
        value = String(value).replace(/\D/g, '');

        // Tratando o value para aceitar duas casas decimais
        value = Number(value) / 100;

        // Transformando o tipo de moeda para Real
        value = value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        // Retornando sinal + valor
        return signal + value;
    }    
}

// Formulario do Modal 
const Form = {
    // Buscando os dados do input do modal
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    // Armazenando os valores do input na em função 
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    // Validando se todas as informações foram preenchidas
    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            // Salvando a mensagem de erro
            throw new Error('Por favor, preencha todos os campos');
        }
    },

    // Formatando os dados para salvar
    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    // Limpando os campos após o preenchimento das entrasdas/saidas
    clearFields() {
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },

    // Alterando o comportamento padrão do botão submit
    submit(event) {
        // Para não fazer o comportamento padrão
        event.preventDefault();

        // Executando os passos abaixo, caso falhe captura o erro e finaliza o fluxo
        try {
            // Validando se todas os campos foram preenchidos
            Form.validateFields();

            // Formatando os inputs
            const transaction = Form.formatValues();

            //Adicionando dados na tabela
            Transaction.add(transaction);

            //Limpando os campos 
            Form.clearFields();

            //Fechando Modal
            Modal.close();

        // Capturando e retornando a mensagem de erro capturado do throw
        } catch (error) {
            alert(error.message);
        }
    }
}

// Aplicativo
const App = {
    // Inicialização do App
    init() {
        //Transaction.all.forEach(DOM.addTransaction);
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });

        // Atualizando Balance
        DOM.updateBalance();   
 
        Storage.set(Transaction.all)
    },
    
    // Recarregamento do App
    reload () {
        // Limpando a transação anterior
        DOM.clearTransactions();

        // Iniciando aplicação com os dados atualizados
        App.init();
    }
}

// Inicializando o App
App.init();