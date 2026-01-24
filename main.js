document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling para links da navbar e Mobile Menu Toggle
    // Mobile Menu Drawer Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function toggleMobileMenu() {
        mobileMenuDrawer.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
             toggleMobileMenu();
        });
    });

    // Store Status Logic (Open 19:00 - 00:00)
    function checkStoreStatus() {
        const now = new Date();
        const hour = now.getHours();
        const icon = document.getElementById('store-status-icon');
        const text = document.getElementById('store-status-text');
        
        // Open between 19 (7PM) and 23:59 (11:59PM)
        // Adjust logic if needed (e.g. 00:00 is technically next day 0, so < 1 for midnight closing)
        const isOpen = hour >= 19 || hour < 1; // Allows staying open until 1AM effectively if needed, or strict 00:00

        if (isOpen) {
            if(icon) {
                icon.classList.remove('closed');
                icon.classList.add('open');
            }
            if(text) text.innerText = 'Aberto Agora';
        } else {
             if(icon) {
                icon.classList.remove('open');
                icon.classList.add('closed');
            }
             if(text) text.innerText = 'Fechado Agora';
        }
    }
    checkStoreStatus();
    setInterval(checkStoreStatus, 60000); // Check every minute

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = true;
    }

    // Addresses Shortcut
    const drawerBtnAddresses = document.getElementById('drawer-btn-addresses');
    if (drawerBtnAddresses) {
        drawerBtnAddresses.addEventListener('click', () => {
            toggleMobileMenu(); // Close drawer
            toggleCart(); // Open cart
            goToStep(2); // Go to address step
        });
    }

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

    const nextToStep2 = document.getElementById('next-to-step-2');
    const nextToStep3 = document.getElementById('next-to-step-3');
    const finalCheckoutBtn = document.getElementById('final-checkout-btn');
    const addressForm = document.getElementById('address-form');

    const whatsappNumber = "5563991117181";
    const DELIVERY_FEE = 10.00;

    window.toggleCart = () => {
        cartModal.classList.toggle('open');
        if (!cartModal.classList.contains('open')) {
            setTimeout(() => goToStep(1), 500);
        }
    };

    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

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

    // Payment Method Logic
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const changeContainer = document.getElementById('change-container');
    const changeInput = document.getElementById('change-input');
    const changeMessage = document.getElementById('change-message');
    const noChangeCheckbox = document.getElementById('no-change');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'cash') {
                changeContainer.style.display = 'block';
                if (!noChangeCheckbox.checked) {
                    changeInput.required = true;
                    changeInput.focus();
                }
            } else {
                changeContainer.style.display = 'none';
                changeInput.required = false;
                changeInput.value = '';
                changeMessage.innerText = '';
                noChangeCheckbox.checked = false;
                changeInput.disabled = false;
                changeInput.style.opacity = '1';
            }
        });
    });

    noChangeCheckbox.addEventListener('change', () => {
        if (noChangeCheckbox.checked) {
            changeInput.value = '';
            changeInput.disabled = true;
            changeInput.style.opacity = '0.5';
            changeInput.required = false;
            changeMessage.innerText = '';
        } else {
            changeInput.disabled = false;
            changeInput.style.opacity = '1';
            changeInput.required = true;
            changeInput.focus();
        }
    });

    changeInput.addEventListener('input', calculateChange);

    function calculateChange() {
        if (!changeInput.value || noChangeCheckbox.checked) {
            changeMessage.innerText = '';
            return;
        }

        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const total = subtotal + DELIVERY_FEE;
        const paidAmount = parseFloat(changeInput.value);

        if (paidAmount < total) {
            changeMessage.style.color = '#ef4444';
            changeMessage.innerText = 'Valor insuficiente!';
        } else {
            const change = paidAmount - total;
            changeMessage.style.color = '#22c55e';
            changeMessage.innerText = `Troco: R$ ${change.toFixed(2).replace('.', ',')}`;
        }
    }

    nextToStep3.addEventListener('click', () => {
        if (!addressForm.checkValidity()) {
            addressForm.reportValidity();
            return;
        }

        const selectedPaymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentRadio) {
            alert('Por favor, selecione uma forma de pagamento.');
            document.querySelector('.payment-section').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const selectedPayment = selectedPaymentRadio.value;

        // Validate Cash Payment
        if (selectedPayment === 'cash' && !noChangeCheckbox.checked) {
            const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const total = subtotal + DELIVERY_FEE;
            const paidAmount = parseFloat(changeInput.value);

            if (!paidAmount || paidAmount < total) {
                alert('Por favor, informe um valor valido para o troco (maior ou igual ao total) ou marque "Não preciso".');
                changeInput.focus();
                return;
            }
        }

        goToStep(3);
    });

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const categoryContainers = document.querySelectorAll('.menu-category-container');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            categoryContainers.forEach(container => {
                container.classList.remove('active');
                if (container.id === category) container.classList.add('active');
            });
        });
    });

    // Adicionar ao Carrinho
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-mini')) {
            const btn = e.target;
            const card = btn.closest('.menu-card');
            const name = card.querySelector('h3').innerText;
            const price = parseFloat(card.querySelector('.price').innerText.replace('R$', '').replace(',', '.').trim());
            addToCart(name, price);
        }
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
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCount.innerText = totalItems;
        // Recalculate change if open
        if (changeInput.value && !noChangeCheckbox.checked) calculateChange();
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

    window.changeQuantity = (index, delta) => {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        updateCart();
    };

    function renderConfirmation() {
        const confItemsList = document.getElementById('conf-items-list');
        const confSubtotal = document.getElementById('conf-subtotal');
        const confDelivery = document.getElementById('conf-delivery');
        const confTotalValue = document.getElementById('conf-total-value');
        const confAddressText = document.getElementById('conf-address-text');
        const confCustomerInfo = document.getElementById('conf-customer-info');
        const confPaymentInfo = document.getElementById('conf-payment-info');

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
        const complement = document.getElementById('complement').value;
        confAddressText.innerHTML = `<strong>${street}, nº ${number}</strong><br>${neighborhood}${complement ? '<br>Comp: ' + complement : ''}`;
        confCustomerInfo.innerText = `${name} | ${phone}`;

        // Payment Info
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
        let paymentText = '';
        if (selectedPayment === 'pix') paymentText = 'Pix 💠';
        else if (selectedPayment === 'card') paymentText = 'Cartão 💳';
        else if (selectedPayment === 'cash') {
            if (noChangeCheckbox.checked) {
                paymentText = 'Dinheiro 💵 (Sem troco)';
            } else {
                const paid = parseFloat(changeInput.value);
                const change = paid - total;
                paymentText = `Dinheiro 💵 (Troco para R$ ${paid.toFixed(2).replace('.', ',')} | Retorno: R$ ${change.toFixed(2).replace('.', ',')})`;
            }
        }
        confPaymentInfo.innerText = `Forma de Pagamento: ${paymentText}`;
    }

    // Client Database Logic
    const phoneInput = document.getElementById('phone');
    const nameInput = document.getElementById('name');
    const streetInput = document.getElementById('street');
    const numberInput = document.getElementById('number');
    const neighborhoodInput = document.getElementById('neighborhood');
    const complementInput = document.getElementById('complement');
    const savedAddressesContainer = document.getElementById('saved-addresses-container');
    const savedAddressesList = document.getElementById('saved-addresses-list');
    const btnNewAddress = document.getElementById('btn-new-address');
    const newAddressFields = document.getElementById('new-address-fields');

    let selectedAddress = null;

    const noNumberCheckbox = document.getElementById('no-number');

    noNumberCheckbox.addEventListener('change', () => {
        if (noNumberCheckbox.checked) {
            numberInput.value = 'S/N';
            numberInput.disabled = true;
            numberInput.style.opacity = '0.5';
        } else {
            numberInput.value = '';
            numberInput.disabled = false;
            numberInput.style.opacity = '1';
        }
    });

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;
        e.target.value = value;
    });

    phoneInput.addEventListener('blur', () => {
        const phone = phoneInput.value.replace(/\D/g, '');
        if (phone.length >= 10) loadClientData(phone);
    });

    btnNewAddress.addEventListener('click', () => {
        selectedAddress = null;
        document.querySelectorAll('.address-card').forEach(el => el.classList.remove('selected'));
        newAddressFields.style.display = 'block';
        clearAddressFields();
    });

    function loadClientData(phone) {
        const db = JSON.parse(localStorage.getItem('pontodosabor_clients')) || {};
        const client = db[phone];
        if (client) {
            nameInput.value = client.name || '';
            if (client.addresses && client.addresses.length > 0) {
                renderSavedAddresses(client.addresses);
                savedAddressesContainer.style.display = 'block';
                newAddressFields.style.display = 'none';
            } else {
                savedAddressesContainer.style.display = 'none';
                newAddressFields.style.display = 'block';
            }
        } else {
            savedAddressesContainer.style.display = 'none';
            newAddressFields.style.display = 'block';
        }
    }

    function renderSavedAddresses(addresses) {
        savedAddressesList.innerHTML = '';
        addresses.forEach((addr, index) => {
            const div = document.createElement('div');
            div.className = 'address-card';
            div.innerHTML = `<div><strong>${addr.street}, ${addr.number}</strong><p>${addr.neighborhood} ${addr.complement ? '- ' + addr.complement : ''}</p></div>`;
            div.onclick = () => selectAddress(addr, div);
            savedAddressesList.appendChild(div);
        });
    }

    function selectAddress(addr, element) {
        selectedAddress = addr;
        document.querySelectorAll('.address-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        streetInput.value = addr.street;
        numberInput.value = addr.number;
        neighborhoodInput.value = addr.neighborhood;
        complementInput.value = addr.complement || '';
        newAddressFields.style.display = 'none';
    }

    function clearAddressFields() {
        streetInput.value = ''; numberInput.value = ''; neighborhoodInput.value = ''; complementInput.value = '';
    }

    function saveClientData() {
        const phone = phoneInput.value.replace(/\D/g, '');
        const name = nameInput.value;
        const newAddr = { street: streetInput.value, number: numberInput.value, neighborhood: neighborhoodInput.value, complement: complementInput.value };
        let db = JSON.parse(localStorage.getItem('pontodosabor_clients')) || {};
        if (!db[phone]) db[phone] = { name: name, addresses: [] };
        const exists = db[phone].addresses.some(a => a.street === newAddr.street && a.number === newAddr.number);
        if (!exists && !selectedAddress) db[phone].addresses.push(newAddr);
        db[phone].name = name;
        localStorage.setItem('pontodosabor_clients', JSON.stringify(db));
    }

    finalCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        saveClientData();
        const name = nameInput.value;
        const phone = phoneInput.value;
        const street = streetInput.value;
        const number = numberInput.value;
        const neighborhood = neighborhoodInput.value;
        const complement = complementInput.value;
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (!name || !phone || !street || !number || !neighborhood) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        let message = `*Novo Pedido - Ponto do Sabor* 🍔\n\n`;
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

        // Payment Info in Message
        let paymentStr = '';
        if (selectedPayment === 'pix') paymentStr = 'Pix';
        else if (selectedPayment === 'card') paymentStr = 'Cartão';
        else if (selectedPayment === 'cash') {
            if (noChangeCheckbox.checked) {
                paymentStr = 'Dinheiro (Sem troco)';
            } else {
                const paid = parseFloat(changeInput.value);
                const change = paid - total;
                paymentStr = `Dinheiro (Troco para R$ ${paid.toFixed(2).replace('.', ',')})`;
            }
        }
        message += `*FORMA DE PAGAMENTO:* ${paymentStr}\n\n`;

        message += `*ENDEREÇO DE ENTREGA:*\n${street}, nº ${number}\n${neighborhood}\n`;
        if (complement) message += `Complemento: ${complement}\n`;
        message += `Araguaína - TO`;

        const encodedMessage = encodeURIComponent(message);

        // Abrir WhatsApp diretamente
        window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        // Limpar Estado
        cart = [];
        updateCart();
        toggleCart();
        addressForm.reset();
        selectedAddress = null;
        setTimeout(() => {
            alert("Obrigado! Seu pedido foi encaminhado para o WhatsApp.");
            goToStep(1);
        }, 1000);
    });

    // Animação IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.menu-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
});

