document.addEventListener('DOMContentLoaded', () => {
    // ==================== PRODUCT DATABASE ====================
    const products = [
        {
            id: 'p1',
            name: 'Steinway & Sons Model D',
            category: 'Grand Piano',
            price: '$185,000',
            image: 'assets/grand_piano.png',
            badge: 'Premium',
            desc: 'The pinnacle of concert grands. Featuring a majestic resonance and peerless touch, the Model D is the overwhelming choice of the world\'s greatest pianists.',
            specs: {
                'Brand': 'Steinway & Sons',
                'Wood Type': 'Ebonized Maple & Mahogany',
                'Length': '8\' 11¾" (274 cm)',
                'Weight': '990 lbs (480 kg)',
                'Origin': 'Hamburg, Germany'
            }
        },
        {
            id: 'p2',
            name: 'Yamaha U3 Upright',
            category: 'Acoustic Piano',
            price: '$14,500',
            image: 'assets/upright_piano.png',
            badge: 'New Arrival',
            desc: 'An expansive soundboard and acoustic chamber give the 52" U3 extended power and projection, with the peerless tonal and expressive control of the legendary Yamaha action.',
            specs: {
                'Brand': 'Yamaha',
                'Wood Type': 'Spruce Soundboard',
                'Height': '52" (131 cm)',
                'Weight': '517 lbs (235 kg)',
                'Origin': 'Japan'
            }
        },
        {
            id: 'p3',
            name: 'Roland LX708',
            category: 'Digital Piano',
            price: '$5,999',
            image: 'assets/digital_piano.png',
            badge: 'Top Rated',
            desc: 'A luxurious multi-speaker digital piano with the tone and touch of a world-class grand.',
            specs: {
                'Brand': 'Roland',
                'Action': 'Hybrid Grand Keyboard',
                'Speakers': '8-speaker system',
                'Origin': 'Japan'
            }
        },
        {
            id: 'g1',
            name: 'Martin D-28',
            category: 'Acoustic Guitar',
            price: '$3,199',
            image: 'assets/acoustic_guitar.png',
            badge: 'Premium',
            desc: 'The dreadnought by which all others are judged. Constructed of solid East Indian rosewood back and sides, and a Sitka spruce top.',
            specs: {
                'Brand': 'Martin',
                'Top Wood': 'Sitka Spruce',
                'Back/Sides': 'East Indian Rosewood',
                'Neck': 'Mahogany',
                'Origin': 'USA'
            }
        },
        {
            id: 'g2',
            name: 'Fender Stratocaster American Professional II',
            category: 'Electric Guitar',
            price: '$1,899',
            image: 'assets/electric_guitar.png',
            badge: 'New Arrival',
            desc: 'Draws from more than sixty years of innovation, inspiration and evolution to meet the demands of today\'s working player.',
            specs: {
                'Brand': 'Fender',
                'Body Wood': 'Alder',
                'Neck': 'Maple (Deep "C" Profile)',
                'Pickups': 'V-Mod II Single-Coil Strat',
                'Origin': 'USA'
            }
        },
        {
            id: 'g3',
            name: 'Gibson Les Paul Standard 50s',
            category: 'Electric Guitar',
            price: '$2,799',
            image: 'assets/electric_guitar.png',
            badge: 'Classic',
            desc: 'The new Les Paul Standard returns to the classic design that made it relevant, played and loved.',
            specs: {
                'Brand': 'Gibson',
                'Body Wood': 'Mahogany with Maple top',
                'Neck': 'Vintage 50s Mahogany',
                'Pickups': 'Burstbucker 1 & 2',
                'Origin': 'USA'
            }
        }
    ];

    // ==================== CONFIGURATION ====================
    const STORE_PHONE = '9647000000000';
    const INSTAGRAM_HANDLE = 'iraqipiano';
    const WEBHOOK_URL = 'https://hook.eu1.make.com/u0e7187g7cpjtt4tdifclb6scucfgvwe';
    const TELEGRAM_REDIRECT = 'https://t.me/IraqiPianoBot'; // Telegram bot/channel for post-checkout

    // ==================== DOM REFERENCES ====================
    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const searchInput = document.getElementById('search-input');

    const cartToggle = document.getElementById('cart-toggle');
    const cartBadge = document.getElementById('cart-badge');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartClose = document.getElementById('cart-close');
    const cartCheckout = document.getElementById('cart-checkout');
    const cartFooter = document.getElementById('cart-footer');
    const cartErrorEl = document.getElementById('cart-error');
    const cartErrorText = document.getElementById('cart-error-text');
    const checkoutLabel = cartCheckout.querySelector('.checkout-label');
    const checkoutSpinner = cartCheckout.querySelector('.checkout-spinner');

    const checkoutForm = document.getElementById('checkout-form');
    const customerName = document.getElementById('customer-name');
    const customerPhone = document.getElementById('customer-phone');
    const customerCity = document.getElementById('customer-city');
    const customerAddress = document.getElementById('customer-address');

    // Toast element (created dynamically)
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> <span></span>';
    document.body.appendChild(toast);

    // ==================== CART STATE ====================
    let cart = [];
    let isSubmitting = false; // Prevents double submissions

    // ==================== PRICE HELPERS ====================
    function parsePrice(priceStr) {
        return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
    }

    function formatPrice(value) {
        return '$' + value.toLocaleString('en-US');
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => sum + parsePrice(item.price) * item.qty, 0);
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.qty, 0);
    }

    // ==================== ORDER ID GENERATOR ====================
    function generateOrderId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `MST-${timestamp}-${randomPart}`;
    }

    // ==================== CART ACTIONS ====================
    function addToCart(productId, e) {
        if (e) {
            e.stopPropagation();
        }
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }

        updateCartUI();
        showToast(product.name, 'added');
        animateBadge();

        // Button feedback
        if (e) {
            const btn = e.currentTarget;
            btn.classList.add('added');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
            }, 1200);
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    }

    function changeQty(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(productId);
            return;
        }
        updateCartUI();
    }

    // ==================== CART UI RENDERING ====================
    function updateCartUI() {
        const count = getCartCount();
        const total = getCartTotal();

        // Badge
        cartBadge.textContent = count;
        cartBadge.classList.toggle('empty', count === 0);

        // Summary values
        cartTotalPrice.textContent = formatPrice(total);
        cartSubtotal.textContent = formatPrice(total);
        cartItemCount.textContent = count;

        // Footer visibility
        cartFooter.style.display = count > 0 ? 'block' : 'none';

        // Update validation state when cart changes
        if (typeof validateCheckoutForm === 'function') {
            validateCheckoutForm();
        }

        // Clear any previous errors when cart changes
        hideError();

        // Cart items list
        if (cart.length === 0) {
            cartItemsEl.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Your cart is empty</p>
                    <span>Add some instruments to get started!</span>
                </div>`;
            return;
        }

        cartItemsEl.innerHTML = cart.map(item => {
            const unitPrice = parsePrice(item.price);
            const lineTotal = unitPrice * item.qty;
            const showLineTotal = item.qty > 1;
            return `
            <div class="cart-item" data-id="${item.id}">
                <img class="cart-item-img" src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name" title="${item.name}">${item.name}</div>
                    <div class="cart-item-category">${item.category}</div>
                    <div class="cart-item-pricing">
                        <span class="cart-item-price">${item.price}${showLineTotal ? ' each' : ''}</span>
                        ${showLineTotal ? `<span class="cart-item-linetotal">${formatPrice(lineTotal)}</span>` : ''}
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn qty-minus" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
            </div>`;
        }).join('');

        // Attach qty and remove listeners
        cartItemsEl.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
        });
        cartItemsEl.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
        });
        cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
        });
    }

    function animateBadge() {
        cartBadge.classList.remove('bounce');
        void cartBadge.offsetWidth;
        cartBadge.classList.add('bounce');
    }

    function showToast(text, type = 'added') {
        const icon = toast.querySelector('i');
        const span = toast.querySelector('span');

        if (type === 'added') {
            icon.className = 'fa-solid fa-check-circle';
            span.textContent = `${text} added to cart`;
            toast.classList.remove('error-toast');
        } else if (type === 'success') {
            icon.className = 'fa-solid fa-check-circle';
            span.textContent = text;
            toast.classList.remove('error-toast');
        } else if (type === 'error') {
            icon.className = 'fa-solid fa-circle-exclamation';
            span.textContent = text;
            toast.classList.add('error-toast');
        }

        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    // ==================== ERROR DISPLAY ====================
    function showError(message) {
        cartErrorText.textContent = message;
        cartErrorEl.style.display = 'flex';
        // Re-trigger shake animation
        cartErrorEl.style.animation = 'none';
        void cartErrorEl.offsetWidth;
        cartErrorEl.style.animation = '';
    }

    function hideError() {
        cartErrorEl.style.display = 'none';
    }

    // ==================== CHECKOUT VALIDATION ====================
    function validateCheckoutForm() {
        const nameVal = customerName.value.trim();
        const phoneVal = customerPhone.value.trim();
        const cityVal = customerCity.value.trim();
        const addressVal = customerAddress.value.trim();

        const phoneRegex = /^[+]?[\d\s-]{6,20}$/;
        const isPhoneValid = phoneVal !== '' && phoneRegex.test(phoneVal);

        const isValid = nameVal !== '' && isPhoneValid && cityVal !== '' && addressVal !== '' && cart.length > 0;

        if (!isSubmitting) {
            cartCheckout.disabled = !isValid;
        }

        return isValid;
    }

    [customerName, customerPhone, customerCity, customerAddress].forEach(input => {
        input.addEventListener('input', validateCheckoutForm);
    });

    // ==================== CHECKOUT LOADING STATE ====================
    function setCheckoutLoading(loading) {
        isSubmitting = loading;

        if (loading) {
            cartCheckout.disabled = true;
            checkoutLabel.style.display = 'none';
            checkoutSpinner.style.display = 'inline-flex';
        } else {
            validateCheckoutForm();
            checkoutLabel.style.display = 'inline-flex';
            checkoutSpinner.style.display = 'none';
        }
    }

    // ==================== BUILD ORDER PAYLOAD ====================
    function buildOrderPayload() {
        const orderId = generateOrderId();
        
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        let hh = date.getHours();
        const min = String(date.getMinutes()).padStart(2, '0');
        const ampm = hh >= 12 ? 'pm' : 'am';
        hh = hh % 12;
        hh = hh ? hh : 12;
        const formattedDate = `${yyyy}-${mm}-${dd} / ${String(hh).padStart(2, '0')}:${min} ${ampm}`;
        
        const totalItems = getCartCount();
        const totalPrice = getCartTotal();

        // Build structured items array — each product is a separate object
        const items = cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.qty,
            unitPrice: parsePrice(item.price),
            lineTotal: parsePrice(item.price) * item.qty
        }));

        const custName = customerName.value.trim();
        const custPhone = customerPhone.value.trim();
        const custCity = customerCity.value.trim();
        const custAddress = customerAddress.value.trim();

        // Pre-build Telegram-ready message so Make can send directly
        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const productBlocks = items.map((item, index) => {
            const num = index < 10 ? numberEmojis[index] : `#${index + 1}`;
            return `${num} Product Name: ${item.name}\n\n🔢 Quantity: ${item.quantity}\n\n💰 Unit Price: $${item.unitPrice.toLocaleString('en-US')}\n\n💵 Item Total: $${item.lineTotal.toLocaleString('en-US')}`;
        }).join('\n\n━━━━━━━━━━━━━━\n\n');

        const telegramMessage = `🛒 NEW ORDER\n\n👤 Customer Information\n\n📝 Name:\n${custName}\n\n📞 Phone:\n${custPhone}\n\n🏙️ City:\n${custCity}\n\n📍 Address:\n${custAddress}\n\n━━━━━━━━━━━━━━\n\n📦 Products\n\n${productBlocks}\n\n━━━━━━━━━━━━━━\n\n📊 Order Summary\n\n🛍️ Total Items: ${totalItems}\n\n💵 Grand Total: $${totalPrice.toLocaleString('en-US')}\n\n📅 Order Date:\n${formattedDate}`;

        const productsSummary = items.map((item, index) => `${index + 1}. ${item.name} × ${item.quantity}`).join('\n');

        return {
            orderId,
            createdAt: formattedDate,
            customer: {
                name: custName,
                phone: custPhone,
                city: custCity,
                address: custAddress
            },
            cart: {
                totalItems,
                subtotal: totalPrice,
                totalPrice,
                items
            },
            telegramMessage,
            productsSummary
        };
    }

    // ==================== CHECKOUT — WEBHOOK ====================
    async function handleCheckout(e) {
        if (e) e.preventDefault();

        // Guard: empty cart
        if (cart.length === 0) return;

        // Guard: already submitting (prevent double-click)
        if (isSubmitting) return;

        // Final validation check
        if (!validateCheckoutForm()) {
            showError('Please fill all required fields correctly.');
            return;
        }

        // Clear previous errors
        hideError();

        // Validate cart integrity before sending
        const invalidItems = cart.filter(item => !item.id || !item.name || !item.price || item.qty < 1);
        if (invalidItems.length > 0) {
            showError('Some items in your cart are invalid. Please remove them and try again.');
            return;
        }

        // Build the payload
        const payload = buildOrderPayload();

        // Enter loading state
        setCheckoutLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // Server returned an error status
                let errorMsg = 'Order submission failed.';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch {
                    // Response body wasn't JSON, use status text
                    errorMsg = `Server error (${response.status}). Please try again.`;
                }
                throw new Error(errorMsg);
            }

            // ✅ SUCCESS — webhook accepted the order
            // Clear cart AFTER confirmed success
            cart = [];
            checkoutForm.reset();
            updateCartUI();

            showToast('Order placed successfully!', 'success');

            // Brief delay so user sees the success toast, then close
            setTimeout(() => {
                closeCart();
            }, 1500);

        } catch (error) {
            // ❌ FAILURE — show error, keep cart intact, allow retry
            const message = error.name === 'TypeError'
                ? 'Network error. Please check your connection and try again.'
                : (error.message || 'Something went wrong. Please try again.');

            showError(message);
            showToast('Checkout failed — please retry', 'error');
        } finally {
            setCheckoutLoading(false);
        }
    }

    // Attach checkout handler
    cartCheckout.addEventListener('click', handleCheckout);

    // ==================== CART SIDEBAR OPEN/CLOSE ====================
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
            closeCart();
        }
    });

    // ==================== RENDER PRODUCTS ====================
    function renderProducts(filterText = '') {
        const pianoGrid = document.getElementById('piano-grid');
        const guitarGrid = document.getElementById('guitar-grid');
        if (!pianoGrid || !guitarGrid) return;

        const lowerFilter = filterText.toLowerCase();
        const filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(lowerFilter) ||
            p.category.toLowerCase().includes(lowerFilter) ||
            p.desc.toLowerCase().includes(lowerFilter)
        );

        const pianos = filteredProducts.filter(p => p.category.includes('Piano'));
        const guitars = filteredProducts.filter(p => p.category.includes('Guitar'));

        const renderGrid = (items) => items.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</span>` : ''}
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${product.price}</div>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        pianoGrid.innerHTML = pianos.length ? renderGrid(pianos) : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No pianos found matching your search.</p>';
        guitarGrid.innerHTML = guitars.length ? renderGrid(guitars) : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No guitars found matching your search.</p>';

        // Card click → open detail modal
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                const id = card.getAttribute('data-id');
                const product = products.find(p => p.id === id);
                if (product) openProductDetail(product);
            });
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                addToCart(btn.dataset.id, e);
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }

    // ==================== PRODUCT DETAIL MODAL ====================
    function openProductDetail(product) {
        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-img').alt = product.name;
        document.getElementById('modal-title').textContent = product.name;
        document.getElementById('modal-category').textContent = product.category;
        document.getElementById('modal-price').textContent = product.price;
        document.getElementById('modal-desc').textContent = product.desc;

        const specsContainer = document.getElementById('modal-specs');
        specsContainer.innerHTML = Object.entries(product.specs).map(([key, value]) => `
            <div class="spec-row">
                <span class="spec-label">${key}</span>
                <span class="spec-value">${value}</span>
            </div>
        `).join('');

        // Set up the modal Add to Cart button
        const modalCartBtn = document.getElementById('btn-modal-add-cart');
        modalCartBtn.dataset.id = product.id;
        modalCartBtn.classList.remove('added');
        modalCartBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';

        // Remove old listener to prevent stacking
        const newBtn = modalCartBtn.cloneNode(true);
        modalCartBtn.parentNode.replaceChild(newBtn, modalCartBtn);

        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product.id, null);
            newBtn.classList.add('added');
            newBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added Successfully';
            animateBadge();
            setTimeout(() => {
                newBtn.classList.remove('added');
                newBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
            }, 1500);
        });

        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ==================== INITIALIZE ====================
    renderProducts();
    updateCartUI();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'var(--glass-bg)';
        }
    });
});
