document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close');

    // Sample fallback products jika API tidak tersedia
    const fallbackProducts = [
        {
            id: 1,
            name: "Paracetamol 500mg",
            description: "Obat penurun panas dan pereda nyeri",
            price: "15000",
            category: "Obat Bebas",
            image: null,
            icon: "💊",
            details: "Paracetamol adalah obat yang digunakan untuk meredakan nyeri ringan hingga sedang dan menurunkan demam. Cocok untuk sakit kepala, nyeri gigi, dan demam.",
            usage: "Dewasa: 1-2 tablet setiap 4-6 jam. Maksimal 8 tablet per hari.",
            sideEffects: "Jarang terjadi efek samping jika digunakan sesuai dosis.",
            stock: "Tersedia"
        },
        {
            id: 2,
            name: "Vitamin C 1000mg",
            description: "Suplemen vitamin C untuk daya tahan tubuh",
            price: "45000",
            category: "Suplemen",
            image: null,
            icon: "🍊",
            details: "Vitamin C dosis tinggi untuk meningkatkan sistem imun tubuh dan membantu penyerapan zat besi.",
            usage: "1 tablet per hari setelah makan.",
            sideEffects: "Dapat menyebabkan gangguan pencernaan jika dikonsumsi berlebihan.",
            stock: "Tersedia"
        },
        {
            id: 3,
            name: "Betadine Solution",
            description: "Antiseptik untuk luka luar",
            price: "25000",
            category: "Perawatan Luka",
            image: null,
            icon: "🩹",
            details: "Larutan antiseptik povidone iodine untuk membersihkan dan mencegah infeksi pada luka.",
            usage: "Oleskan pada area luka yang telah dibersihkan 2-3 kali sehari.",
            sideEffects: "Dapat menyebabkan iritasi pada kulit sensitif.",
            stock: "Tersedia"
        }
    ];

    let currentProducts = [];

    // Function untuk fetch products dari API
    async function fetchProducts() {
        try {
            productList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #667eea; font-size: 1.1rem;">⏳ Memuat produk...</div>';
            
            const res = await fetch('/api/products');
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const products = await res.json();
            
            // Menambahkan properties yang dibutuhkan untuk modal jika tidak ada
            const enhancedProducts = products.map((product, index) => ({
                ...product,
                id: product.id || index + 1,
                category: product.category || "Produk Kesehatan",
                icon: getProductIcon(product.name || product.category),
                details: product.details || product.description || "Detail produk akan segera tersedia.",
                usage: product.usage || "Gunakan sesuai petunjuk dokter atau apoteker.",
                sideEffects: product.sideEffects || "Konsultasikan dengan apoteker jika terjadi efek samping.",
                stock: product.stock || "Tersedia"
            }));
            
            currentProducts = enhancedProducts;
            displayProducts(enhancedProducts);
            
        } catch (error) {
            console.error('Gagal mengambil produk dari API:', error);
            console.log('Menggunakan produk fallback...');
            currentProducts = fallbackProducts;
            displayProducts(fallbackProducts);
        }
    }

    // Function untuk menentukan icon berdasarkan nama/kategori produk
    function getProductIcon(name) {
        const nameUpper = name.toUpperCase();
        if (nameUpper.includes('PARACETAMOL') || nameUpper.includes('PAINKILLER')) return '💊';
        if (nameUpper.includes('VITAMIN')) return '🍊';
        if (nameUpper.includes('BETADINE') || nameUpper.includes('ANTISEPTIK')) return '🩹';
        if (nameUpper.includes('ANTIMO') || nameUpper.includes('MUAL')) return '🚗';
        if (nameUpper.includes('PLESTER') || nameUpper.includes('HANSAPLAST')) return '🏥';
        if (nameUpper.includes('MYLANTA') || nameUpper.includes('MAAG')) return '🥛';
        if (nameUpper.includes('ANTIBIOTIK')) return '💉';
        if (nameUpper.includes('OBAT BATUK')) return '🍯';
        if (nameUpper.includes('SALEP')) return '🧴';
        return '💊'; // default icon
    }

    // Function untuk format harga
    function formatPrice(price) {
        if (typeof price === 'string' && price.includes('Rp')) {
            return price;
        }
        const numPrice = parseInt(price) || 0;
        return `Rp ${numPrice.toLocaleString('id-ID')}`;
    }

    // Function untuk display products
    function displayProducts(products) {
        if (!products || products.length === 0) {
            productList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #718096;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <h3 style="color: #4a5568; margin-bottom: 0.5rem;">Belum ada produk yang tersedia</h3>
                    <p>Produk akan segera ditambahkan. Silakan coba lagi nanti.</p>
                </div>
            `;
            return;
        }
        
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.setAttribute('data-product-id', product.id);
            
            // Tentukan apakah menggunakan gambar atau icon
            const imageElement = product.image && product.image !== '' 
                ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3.5rem;">${product.icon || '💊'}</div>`
                : `<div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3.5rem; position: relative; z-index: 2;">${product.icon || '💊'}</div>`;

            productCard.innerHTML = `
                <div class="product-image">
                    ${imageElement}
                    <div class="product-badge">${product.category}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>    
                    <p class="product-desc">${product.description || 'Tidak ada deskripsi.'}</p>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <button class="product-button" onclick="showProductDetail(${product.id})">
                        Lihat Detail
                    </button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    // Function untuk show product detail modal
    function showProductDetail(productId) {
        const product = currentProducts.find(p => p.id == productId);
        if (!product) {
            console.error('Produk tidak ditemukan:', productId);
            return;
        }

        modalTitle.textContent = product.name;
        
        // Tentukan URL gambar atau fallback icon
        const imageUrl = product.image && product.image !== '' 
            ? product.image 
            : `https://via.placeholder.com/600`; // Gambar placeholder yang lebih besar

        // Set modal image, sekarang dibungkus dengan tag <a>
        modalImage.innerHTML = `
            <a href="${imageUrl}" target="_blank" style="display: block;">
                <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 2;" onerror="this.onerror=null;this.src='https://via.placeholder.com/600';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4.5rem; position: relative; z-index: 2;">${product.icon || '💊'}</div>
            </a>
        `;
        
        // ... (modalContent.innerHTML yang sudah ada, tidak perlu diubah) ...
        modalContent.innerHTML = `
            <h3 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; font-weight: 800;">${product.name}</h3>
            <p style="margin-bottom: 1rem;"><strong>Kategori:</strong> ${product.category}</p>
            <p style="margin-bottom: 1rem;"><strong>Harga:</strong> <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 1.3rem; font-weight: bold;">${formatPrice(product.price)}</span></p>
            <p style="margin-bottom: 1rem;"><strong>Status:</strong> <span style="color: #4facfe; font-weight: 600;">${product.stock}</span></p>
            
            <h4 style="color: #4a5568; margin: 1.5rem 0 0.5rem 0; font-weight: 700;">Deskripsi:</h4>
            <p style="margin-bottom: 1rem; line-height: 1.6; color: #718096;">${product.details}</p>
            
            <h4 style="color: #4a5568; margin: 1.5rem 0 0.5rem 0; font-weight: 700;">Cara Penggunaan:</h4>
            <p style="margin-bottom: 1rem; line-height: 1.6; color: #718096;">${product.usage}</p>
            
            <h4 style="color: #4a5568; margin: 1.5rem 0 0.5rem 0; font-weight: 700;">Efek Samping:</h4>
            <p style="margin-bottom: 2rem; line-height: 1.6; color: #718096;">${product.sideEffects}</p>
            
            <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 35px; border-radius: 25px; font-weight: 700; cursor: pointer; width: 100%; font-size: 1.1rem; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.3)'">
                🛒 Tambah ke Keranjang
            </button>
        `;

        modal.style.display = 'block';
    }

    // Make showProductDetail global
    window.showProductDetail = showProductDetail;

    // Modal close handlers
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.25)';
            }
        }
    });

    // Initialize
    fetchProducts();
});