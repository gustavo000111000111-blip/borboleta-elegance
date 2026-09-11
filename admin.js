let selectedFiles = [];

function openProductForm() {
    document.getElementById('adminModal').classList.add('open');
    document.getElementById('adminModalOverlay').classList.add('open');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('open');
    document.getElementById('adminModalOverlay').classList.remove('open');
    document.getElementById('productForm').reset();
    selectedFiles = [];
    updatePreviewUI();
}

function toggleSizeSelection() {
    const cat = document.getElementById('pCategoria').value;
    const sizeGroup = document.getElementById('sizeGroup');
    sizeGroup.style.display = (cat === 'roupas') ? 'block' : 'none';
}

function previewImages(event) {
    const files = Array.from(event.target.files);
    
    if (selectedFiles.length + files.length > 5) {
        alert("Você pode selecionar no máximo 5 fotos.");
        return;
    }

    selectedFiles = [...selectedFiles, ...files];
    updatePreviewUI();
}

function removePhoto(index) {
    selectedFiles.splice(index, 1);
    updatePreviewUI();
}

function updatePreviewUI() {
    const previewGrid = document.getElementById('imagePreviews');
    const photoCounter = document.getElementById('photoCounter');
    const submitBtn = document.getElementById('btnSaveProduct');

    previewGrid.innerHTML = '';

    selectedFiles.forEach((file, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        const btnRemove = document.createElement('button');
        btnRemove.type = 'button';
        btnRemove.className = 'remove-photo-btn';
        btnRemove.innerHTML = '✕';
        btnRemove.onclick = () => removePhoto(idx);

        div.appendChild(img);
        div.appendChild(btnRemove);
        previewGrid.appendChild(div);
    });

    photoCounter.innerText = `${selectedFiles.length} de 5 fotos selecionadas`;
    
    // Habilita salvar somente se houver de 3 a 5 fotos
    submitBtn.disabled = selectedFiles.length < 3 || selectedFiles.length > 5;
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('btnSaveProduct');
    submitBtn.disabled = true;
    submitBtn.innerText = "Enviando e salvando...";

    const formData = new FormData();
    formData.append('nome', document.getElementById('pNome').value);
    formData.append('preco', document.getElementById('pPreco').value);
    formData.append('categoria', document.getElementById('pCategoria').value);
    formData.append('cor', document.getElementById('pCor').value);

    // Tamanhos
    const sizeCheckboxes = document.querySelectorAll('input[name="tamanhos"]:checked');
    sizeCheckboxes.forEach(cb => formData.append('tamanhos', cb.value));

    // Fotos
    selectedFiles.forEach(file => formData.append('fotos', file));

    try {
        const res = await fetch('/api/produtos', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Produto cadastrado com sucesso!");
            closeAdminModal();
            loadAdminProducts();
        } else {
            alert(`Erro: ${data.error || 'Falha ao cadastrar'}`);
        }
    } catch (err) {
        alert("Erro de conexão ao salvar produto.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Salvar e Publicar Item";
    }
}

async function loadAdminProducts() {
    const list = document.getElementById('adminProductList');
    try {
        const res = await fetch('/api/produtos');
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            list.innerHTML = '<p style="color:#777;">Nenhum produto cadastrado.</p>';
            return;
        }

        list.innerHTML = data.map(p => `
            <div class="admin-item-card">
                <img src="${p.imgs[0] || 'https://via.placeholder.com/150'}" class="admin-item-img">
                <div class="admin-item-title">${p.nome}</div>
                <div class="admin-item-price">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
                ${p.cor ? `<div style="font-size:12px; color:#666;">Cor: ${p.cor}</div>` : ''}
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Excluir Item</button>
            </div>
        `).join('');
    } catch (err) {
        list.innerHTML = '<p style="color:#e74c3c;">Erro ao carregar produtos.</p>';
    }
}

async function deleteProduct(id) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
        const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Item excluído!");
            loadAdminProducts();
        } else {
            alert("Erro ao excluir item.");
        }
    } catch (err) {
        alert("Erro ao tentar excluir.");
    }
}

loadAdminProducts();
