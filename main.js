document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling para links da navbar
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.hash !== "") {
                e.preventDefault();
                const hash = link.hash;
                const target = document.querySelector(hash);

                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Efeito de rolagem na navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
            navbar.style.padding = '20px 0';
            navbar.style.background = 'rgba(15, 23, 42, 0.8)';
        }
    });

    // Estado do Carrinho
    let cart = [];
    let currentStep = 1;

    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalValue = document.getElementById('cart-total-value');

    // Novos elementos do Checkout multi-etapa
    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const finalCheckoutBtn = document.getElementById('final-checkout-btn');
    const addressForm = document.getElementById('address-form');

    // WhatsApp & Preços
    const whatsappNumber = "5563991117181";
    const DELIVERY_FEE = 10.00;

    // Abrir/Fechar Carrinho
    window.toggleCart = () => {
        cartModal.classList.toggle('open');
        if (!cartModal.classList.contains('open')) {
            setTimeout(() => goToStep(1), 500); // Reseta para o passo 1 ao fechar
        }
    };

    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Navegação entre passos
    window.goToStep = (step) => {
        document.querySelectorAll('.cart-step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step-${step}`).classList.add('active');
        currentStep = step;

        if (step === 3) renderConfirmation();
    };

    nextToStep2.addEventListener('click', () => {
        if (cart.length === 0) return alert('Seu carrinho está vazio!');
        goToStep(2);
    });

    nextToStep3.addEventListener('click', () => {
        if (addressForm.checkValidity()) {
            goToStep(3);
        } else {
            addressForm.reportValidity();
        }
    });

    // Adicionar ao Carrinho
    const buyButtons = document.querySelectorAll('.btn-mini');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.menu-card');
            const name = card.querySelector('h3').innerText;
            const price = parseFloat(card.querySelector('.price').innerText.replace('R$', '').replace(',', '.').trim());

            addToCart(name, price);
        });
    });

    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCart();
    }

    function updateCart() {
        renderCart();
        updateCount();
    }

    function updateCount() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCount.innerText = totalItems;
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Seu carrinho está vazio 🍔</p>';
            cartTotalValue.innerText = 'R$ 0,00';
            return;
        }

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="cart-item-actions">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalValue.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    function renderConfirmation() {
        const confItemsList = document.getElementById('conf-items-list');
        const confSubtotal = document.getElementById('conf-subtotal');
        const confDelivery = document.getElementById('conf-delivery');
        const confTotalValue = document.getElementById('conf-total-value');
        const confAddressText = document.getElementById('conf-address-text');
        const confCustomerInfo = document.getElementById('conf-customer-info');

        confItemsList.innerHTML = cart.map(item => `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.9rem;">
                <span>${item.quantity}x ${item.name}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
        `).join('');

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const total = subtotal + DELIVERY_FEE;

        confSubtotal.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        confDelivery.innerText = `R$ ${DELIVERY_FEE.toFixed(2).replace('.', ',')}`;
        confTotalValue.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const street = document.getElementById('street').value;
        const number = document.getElementById('number').value;
        const neighborhood = document.getElementById('neighborhood').value;

        confAddressText.innerHTML = `<strong>${street}, nº ${number}</strong><br>${neighborhood}`;
        confCustomerInfo.innerText = `${name} | ${phone}`;
    }

    // Expondo para o HTML (onclick)
    window.changeQuantity = (index, delta) => {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCart();
    };

    // Checkout WhatsApp Final
    finalCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const street = document.getElementById('street').value;
        const number = document.getElementById('number').value;
        const neighborhood = document.getElementById('neighborhood').value;

        let message = `*Novo Pedido - TexasBurguer* 🍔\n\n`;
        message += `*CLIENTE:* ${name}\n`;
        message += `*CONTATO:* ${phone}\n\n`;

        message += `*ITENS DO PEDIDO:*\n`;
        let subtotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            message += `• ${item.quantity}x ${item.name} - R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`;
            subtotal += itemTotal;
        });

        const total = subtotal + DELIVERY_FEE;

        message += `\n*SUBTOTAL: R$ ${subtotal.toFixed(2).replace('.', ',')}*\n`;
        message += `*TAXA DE ENTREGA: R$ ${DELIVERY_FEE.toFixed(2).replace('.', ',')}*\n`;
        message += `*TOTAL GERAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;

        message += `*ENDEREÇO DE ENTREGA:*\n`;
        message += `${street}, nº ${number}\n`;
        message += `${neighborhood}\n`;
        message += `Araguaína - TO`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    });

    // Animação de entrada dos cards (mantido do seu código)
    const cards = document.querySelectorAll('.menu-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
});
