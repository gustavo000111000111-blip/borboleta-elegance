let selectedFiles = [];

// Adiciona novas fotos acumulando na lista existente
function previewImages(event) {
    const newFiles = Array.from(event.target.files);
    
    // Valida se o total acumulado vai ultrapassar 5 fotos
    if (selectedFiles.length + newFiles.length > 5) {
        alert(`O limite máximo é de 5 fotos. Você já possui ${selectedFiles.length} foto(s) selecionada(s).`);
        event.target.value = ''; 
        return;
    }

    // Acumula os novos arquivos na lista existente
    selectedFiles = [...selectedFiles, ...newFiles];
    
    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';

    updateImagePreviews();
}

// Remove uma foto específica pelo índice
function removePhoto(index) {
    selectedFiles.splice(index, 1);
    updateImagePreviews();
}

// Atualiza as miniaturas na tela com o botão de remover em cada uma
function updateImagePreviews() {
    const previewContainer = document.getElementById('imagePreviews');
    const counter = document.getElementById('photoCounter');
    const btnSave = document.getElementById('btnSaveProduct');

    previewContainer.innerHTML = '';
    counter.innerText = `${selectedFiles.length} de 5 fotos selecionadas`;

    selectedFiles.forEach((file, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-item';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-photo-btn';
        removeBtn.innerHTML = '✕';
        removeBtn.title = 'Remover foto';
        removeBtn.onclick = () => removePhoto(index);

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        previewContainer.appendChild(wrapper);
    });

    // Validação de quantidade (3 a 5 fotos)
    if (selectedFiles.length >= 3 && selectedFiles.length <= 5) {
        btnSave.disabled = false;
        counter.style.color = 'var(--accent-gold)';
    } else {
        btnSave.disabled = true;
        counter.style.color = '#e74c3c';
        if (selectedFiles.length < 3) {
            counter.innerText += " (Mínimo de 3 fotos necessário)";
        }
    }
}

async function loadAdminProducts() {
    try {
        const res = await fetch('/api/produtos');
        const products = await res.json();
        const container = document.getElementById('adminProductList');
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p style="color:#888;">Nenhum produto cadastrado no banco.</p>';
            return;
        }

        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'admin-item-card';
            const mainImg = p.imgs[0] || 'https://via.placeholder.com/300';
            const priceFormatted = typeof p.preco === 'number' ? `R$ ${p.preco.toFixed(2).replace('.', ',')}` : p.preco;

            card.innerHTML = `
                <img src="${mainImg}" class="admin-item-img">
                <div class="admin-item-title">${p.nome}</div>
                <div class="admin-item-price">${priceFormatted}</div>
                <small style="color:#777; text-transform: capitalize;">${p.categoria} | ${p.imgs.length} fotos</small>
                <button class="btn-delete" onclick="deleteProduct(${p.id})"> Excluir</button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Erro ao carregar produtos no admin:", err);
    }
}

function openProductForm() {
    document.getElementById('adminModal').classList.add('open');
    document.getElementById('adminModalOverlay').classList.add('open');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('open');
    document.getElementById('adminModalOverlay').classList.remove('open');
    document.getElementById('productForm').reset();
    selectedFiles = [];
    updateImagePreviews();
}

function toggleSizeSelection() {
    const cat = document.getElementById('pCategoria').value;
    const sizeGroup = document.getElementById('sizeGroup');
    sizeGroup.style.display = cat === 'acessorios' ? 'none' : 'block';
}

async function handleFormSubmit(event) {
    event.preventDefault();

    if (selectedFiles.length < 3 || selectedFiles.length > 5) {
        alert("Por favor, selecione entre 3 e 5 fotos.");
        return;
    }

    const formData = new FormData();
    formData.append('nome', document.getElementById('pNome').value);
    formData.append('preco', document.getElementById('pPreco').value);
    formData.append('categoria', document.getElementById('pCategoria').value);

    // Adiciona os tamanhos
    const checkboxes = document.querySelectorAll('input[name="tamanhos"]:checked');
    checkboxes.forEach(cb => formData.append('tamanhos', cb.value));

    // Adiciona as imagens
    selectedFiles.forEach(file => formData.append('fotos', file));

    try {
        const res = await fetch('/api/produtos', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            closeAdminModal();
            loadAdminProducts();
            alert("Produto cadastrado com sucesso!");
        } else {
            const errData = await res.json();
            alert(`Erro: ${errData.error}`);
        }
    } catch (err) {
        alert("Falha ao comunicar com o servidor.");
    }
}

async function deleteProduct(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
        const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadAdminProducts();
        }
    } catch (err) {
        alert("Erro ao excluir produto.");
    }
}

// Inicializa a listagem
loadAdminProducts();