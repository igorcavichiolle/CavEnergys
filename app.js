// ============================================================
//  CavEnergys — Catálogo de Latinhas Importadas
//  Carrega produtos de products.json (ou futuramente de uma API)
// ============================================================

const CATALOG_EL = document.getElementById('catalog');
const SEARCH_EL  = document.getElementById('searchInput');
const EMPTY_EL   = document.getElementById('emptyState');
const FILTERS_EL = document.getElementById('countryFilters');

let allProducts = [];
let activeCountry = 'all';

// ── Ponto central de dados: troque a URL quando migrar para API ──
const DATA_URL = './products.json';
// Futuramente: const DATA_URL = 'https://api.seusite.com/products';

async function fetchProducts() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Formata preço em BRL ──
function formatPrice(price, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

// ── Gera o HTML de um card ──
function cardHTML(p) {
  return `
    <article class="card" data-id="${p.id}" data-country="${p.country}">
      <div class="card-image-wrap">
        <a href="product.html?id=${p.id}" class="card-img-link" title="Ver detalhes de ${p.name}">
          <img
            src="${p.image}"
            alt="${p.name}"
            loading="lazy"
            onerror="this.src='https://placehold.co/400x300/13131a/7a7a9a?text=Sem+Foto'"
          />
          <div class="card-img-overlay">🔍 Ver detalhes</div>
        </a>
        <span class="card-flag" title="${p.country_name}">${p.flag}</span>
      </div>
      <div class="card-body">
        <h2 class="card-name">
          <a href="product.html?id=${p.id}" class="card-name-link">${p.name}</a>
        </h2>
        <p class="card-country">${p.flag} ${p.country_name}</p>
        
        <div class="card-footer">
          <div class="card-price">
            <span>R$</span>${formatPrice(p.price).replace('R$', '').trim()}
          </div>
          <a href="product.html?id=${p.id}" class="card-btn">Ver mais ⚡</a>
        </div>
      </div>
    </article>
  `;
}

// ── Renderiza lista filtrada ──
function render(products) {
  if (!products.length) {
    CATALOG_EL.innerHTML = '';
    EMPTY_EL.style.display = 'block';
    return;
  }
  EMPTY_EL.style.display = 'none';
  CATALOG_EL.innerHTML = products.map(cardHTML).join('');
}

// ── Aplica filtros: país + busca ──
function applyFilters() {
  const query = SEARCH_EL.value.toLowerCase().trim();

  const filtered = allProducts.filter(p => {
    const matchCountry = activeCountry === 'all' || p.country === activeCountry;
    const matchSearch  = !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.country_name.toLowerCase().includes(query);
    return matchCountry && matchSearch;
  });

  render(filtered);
}

// ── Gera botões de filtro por país ──
function buildCountryFilters(products) {
  const countries = [...new Set(products.map(p => p.country))];
  const extra = countries.map(code => {
    const p = products.find(x => x.country === code);
    return `<button class="filter-btn" data-country="${code}">${p.flag} ${p.country_name}</button>`;
  }).join('');
  FILTERS_EL.insertAdjacentHTML('beforeend', extra);

  FILTERS_EL.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      FILTERS_EL.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCountry = btn.dataset.country;
      applyFilters();
    });
  });
}

// ── Init ──
async function init() {
  try {
    // Skeleton enquanto carrega
    CATALOG_EL.innerHTML = Array(6).fill(`
      <article class="card">
        <div class="card-image-wrap skeleton" style="height:220px;border-radius:0"></div>
        <div class="card-body" style="gap:0.75rem">
          <div class="skeleton" style="height:18px;width:70%"></div>
          <div class="skeleton" style="height:13px;width:40%"></div>
          <div class="skeleton" style="height:48px"></div>
          <div class="skeleton" style="height:36px;margin-top:0.5rem"></div>
        </div>
      </article>
    `).join('');

    allProducts = await fetchProducts();
    buildCountryFilters(allProducts);
    render(allProducts);
  } catch (err) {
    CATALOG_EL.innerHTML = `<p style="color:#ff6b6b;padding:2rem;">Erro ao carregar produtos: ${err.message}</p>`;
  }
}

SEARCH_EL.addEventListener('input', applyFilters);

init();
