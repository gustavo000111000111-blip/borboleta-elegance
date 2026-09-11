// Dados padrão para exibição e fallback (caso a API do servidor falhe)
const mockDatabase = {
    roupas: [
        { id: 1, name: "Vestido Midi Florido", price: "R$ 129,90", imgs: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600"] },
        { id: 2, name: "Cropped Crochê Verão", price: "R$ 79,90", imgs: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600", "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"] },
        { id: 3, name: "Calça Pantalona Elegance", price: "R$ 149,90", imgs: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600", "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"] },
        { id: 4, name: "Blazer Alfaiataria Chic", price: "R$ 199,90", imgs: ["https://images.unsplash.com/photo-1534126511673-b6899657816a?w=600", "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=600", "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600"] },
        { id: 5, name: "Saia Midi Plissada", price: "R$ 99,90", imgs: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600", "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600", "https://images.unsplash.com/photo-1525845859779-54d477ff291f?w=600"] },
        { id: 6, name: "Conjunto Linho Casual", price: "R$ 179,90", imgs: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600", "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600", "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"] },
        { id: 7, name: "Regata Silk Minimal", price: "R$ 59,90", imgs: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600", "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600"] },
        { id: 8, name: "Shorts Jeans Vintage", price: "R$ 89,90", imgs: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600"] },
        { id: 9, name: "Macacão Longo Festa", price: "R$ 219,90", imgs: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600"] },
        { id: 10, name: "Cardigan Tricô Confort", price: "R$ 119,90", imgs: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600", "https://images.unsplash.com/photo-1544441893-675973e31985?w=600", "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600"] }
    ],
    acessorios: [
        { id: 11, name: "Bolsa Transversal Couro", price: "R$ 139,90", imgs: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600"] },
        { id: 12, name: "Óculos de Sol Retrô", price: "R$ 89,90", imgs: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600", "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600", "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"] },
        { id: 13, name: "Brinco Argola Dourada", price: "R$ 49,90", imgs: ["https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600", "https://images.unsplash.com/photo-1611591472152-c070ec952c2c?w=600"] },
        { id: 14, name: "Fone Bluetooth Minimal", price: "R$ 159,90", imgs: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600"] },
        { id: 15, name: "Bolsa Tote Grande", price: "R$ 169,90", imgs: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"] }
    ]
};

let database = JSON.parse(JSON.stringify(mockDatabase));
let currentTab = 'roupas';
let cart = [];
let activeProduct = null;
let currentImageIndex = 0;

// 1. CARREGAR PRODUTOS DO BACKEND (COM FALLBACK)
async function loadProductsFromBackend() {
    try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Falha na requisição');

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            database = {
                roupas: data.filter(p => p.categoria === 'roupas').map(formatProduct),
                acessorios: data.filter(p => p.categoria === 'acessorios').map(formatProduct)
            };
        }
    } catch (error) {
        console.warn('API indisponível. Utilizando banco local pré-carregado.');
    } finally {
        renderProducts(currentTab);
    }
}

function formatProduct(p) {
    let images = p.imgs;
    if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch { images = [images]; }
    }
    if (!Array.isArray(images) || images.length === 0) {
        images = ['https://via.placeholder.com/600'];
    }

    // Captura o valor independentemente se vem como 'preco' (API) ou 'price' (Mock)
    const valorPreco = p.preco !== undefined ? p.preco : p.price;

    return {
        id: p.id,
        name: p.name || p.nome,
        price: typeof valorPreco === 'number' ? `R$ ${valorPreco.toFixed(2).replace('.', ',')}` : valorPreco,
        imgs: images
    };
}

// 2. RENDERIZAÇÃO DA GRADE DE PRODUTOS
function renderProducts(category) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    const items = database[category] || [];

    if (items.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888; padding:30px 0;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    items.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.04}s`;
        card.onclick = () => openProductModal(product);

        const firstImage = (product.imgs && product.imgs.length > 0) ? product.imgs[0] : 'https://via.placeholder.com/600';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${firstImage}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-title">${product.name}</span>
                <span class="product-price">${product.price}</span>
                <button class="buy-btn" onclick="event.stopPropagation(); addToCart('${product.name}', '${product.price}', '${firstImage}')">
                    Adicionar à Sacola
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. TROCA DE ABAS (ROUPAS / ACESSÓRIOS)
function switchTab(category, btnElement) {
    if (currentTab === category) return;
    currentTab = category;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    renderProducts(category);
}

// 4. MODAL E GALERIA
function openProductModal(product) {
    activeProduct = product;
    currentImageIndex = 0;
    updateModalImage();

    document.getElementById('modalTitle').innerText = product.name;
    document.getElementById('modalPrice').innerText = product.price;

    document.getElementById('productModal').classList.add('open');
    document.getElementById('productModalOverlay').classList.add('open');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.getElementById('productModalOverlay').classList.remove('open');
}

function updateModalImage() {
    if (!activeProduct || !activeProduct.imgs || activeProduct.imgs.length === 0) return;
    const imgEl = document.getElementById('modalImg');
    imgEl.style.opacity = '0.3';
    setTimeout(() => {
        imgEl.src = activeProduct.imgs[currentImageIndex];
        imgEl.style.opacity = '1';
    }, 100);
}

function nextImage() {
    if (!activeProduct || !activeProduct.imgs) return;
    currentImageIndex = (currentImageIndex + 1) % activeProduct.imgs.length;
    updateModalImage();
}

function prevImage() {
    if (!activeProduct || !activeProduct.imgs) return;
    currentImageIndex = (currentImageIndex - 1 + activeProduct.imgs.length) % activeProduct.imgs.length;
    updateModalImage();
}

// Suporte a deslize de dedo (Swipe Touch)
let touchStartX = 0;
let touchEndX = 0;
const modalGallery = document.getElementById('modalGallery');

if (modalGallery) {
    modalGallery.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modalGallery.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) nextImage();
    if (touchEndX > touchStartX + 50) prevImage();
}

function addModalProductToCart() {
    if (!activeProduct) return;
    const mainImg = activeProduct.imgs[0] || '';
    addToCart(activeProduct.name, activeProduct.price, mainImg);
    closeProductModal();
}

// 5. GERENCIAMENTO DO CARRINHO / SACOLA
function addToCart(name, price, img) {
    cart.push({ name, price, img });
    updateCartUI();

    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.classList.add('pulse');
        setTimeout(() => cartBtn.classList.remove('pulse'), 400);
    }

    showToast();
}

function showToast() {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function updateCartUI() {
    document.getElementById('cartCount').innerText = cart.length;
    const container = document.getElementById('cartItemsContainer');

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Sua sacola está vazia.</p>';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const numericPrice = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
        total += numericPrice;

        html += `
            <div class="cart-item">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${item.img ? `<img src="${item.img}" style="width:40px; height:40px; object-fit:cover; border-radius:6px;">` : ''}
                    <span><b>${item.name}</b><br><small style="color:var(--accent-gold); font-weight:bold;">${item.price}</small></span>
                </div>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:#e76f51; cursor:pointer; font-weight:bold; font-size:12px;">Remover</button>
            </div>
        `;
    });

    html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:10px; border-top:1px dashed var(--border-color); font-weight:bold;">
            <span>Total:</span>
            <span style="color:var(--accent-gold); font-size:16px;">R$ ${total.toFixed(2).replace('.', ',')}</span>
        </div>
    `;

    container.innerHTML = html;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
}

// 6. FINALIZAR COMPRA VIA WHATSAPP
function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert("Sua sacola está vazia!");
        return;
    }

    let total = 0;
    let message = "Olá! Gostaria de finalizar a compra dos seguintes itens na *Loja Borboleta*:\n\n";

    cart.forEach((item, idx) => {
        message += `${idx + 1}. *${item.name}* - ${item.price}\n`;
        const numericPrice = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
        total += numericPrice;
    });

    message += `\n*Total do Pedido:* R$ ${total.toFixed(2).replace('.', ',')}`;

    const phone = "5511943935765";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// Inicializa o script buscando os produtos no servidor
loadProductsFromBackend();
