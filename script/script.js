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
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

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

// Buscando e substituindo os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) { 
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense';

        const amount = Utils.formatCurrency(transaction.amount);

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

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
}

// Utlidades 
const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, '')) * 100;
        return value;
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';

        value = String(value).replace(/\D/g, '');

        value = Number(value) / 100;

        value = value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        return signal + value;
    }    
}

// Formulario do Modal
const Form = {
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    // Verificando se todas as informações foram preenchidas
    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos');
        }
    },

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

    submit(event) {
        event.preventDefault();

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

        } catch (error) {
            alert(error.message);
        }
    }
}

// Aplicativo
const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();   

        Storage.set(Transaction.all)
    },
    
    reload () {
        DOM.clearTransactions();
        App.init();
    }
}

// Inicializando o App
App.init();