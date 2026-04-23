let items = [];

function displayItems(filteredItems = items) {
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    filteredItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h4>${item.title}</h4>
            <p>$${item.price}</p>
        `;
        container.appendChild(itemDiv);
    });
}

function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function addItem() {
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('image').value;

    if (title && price && image) {
        items.push({ title, price: parseFloat(price), image });
        displayItems();
        // Clear inputs
        document.getElementById('title').value = '';
        document.getElementById('price').value = '';
        document.getElementById('image').value = '';
        // Close modal
        document.getElementById('modal').style.display = 'none';
    } else {
        alert('Please fill all fields');
    }
}

function searchItems() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = items.filter(item => item.title.toLowerCase().includes(query));
    displayItems(filtered);
}

// Optional: Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}