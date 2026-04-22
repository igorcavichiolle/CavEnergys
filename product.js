// ============================================================
//  CavEnergys — Página de Detalhes do Produto
// ============================================================

const DATA_URL = './products.json';

// Pega o ID da URL: product.html?id=3
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'), 10);
}

// Formata preço
function formatPrice(price, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

// Formata data de produção
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }).format(new Date(year, month - 1, day));
}

// ── CARROSSEL ──
let currentIndex = 0;
let totalSlides = 0;

function goToSlide(index) {
  const track = document.getElementById('carouselTrack');
  const dots  = document.querySelectorAll('.dot');
  const thumbs = document.querySelectorAll('.thumb');

  currentIndex = (index + totalSlides) % totalSlides;

  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  dots.forEach((d, i)  => d.classList.toggle('active', i === currentIndex));
  thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
}

function buildCarousel(images) {
  totalSlides = images.length;
  const track = document.getElementById('carouselTrack');
  const dotsEl = document.getElementById('carouselDots');
  const thumbsEl = document.getElementById('thumbnails');

  // Slides
  track.innerHTML = images.map((src, i) => `
    <img src="${src}" alt="Foto ${i + 1}" loading="lazy"
      onerror="this.src='https://placehold.co/800x500/13131a/7a7a9a?text=Sem+Foto'" />
  `).join('');

  // Dots
  dotsEl.innerHTML = images.map((_, i) => `
    <span class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>
  `).join('');

  // Thumbnails
  thumbsEl.innerHTML = images.map((src, i) => `
    <img class="thumb${i === 0 ? ' active' : ''}" src="${src}" alt="Thumb ${i + 1}"
      data-index="${i}" loading="lazy"
      onerror="this.src='https://placehold.co/80x80/13131a/7a7a9a?text=?'" />
  `).join('');

  // Eventos
  document.getElementById('prevBtn').addEventListener('click', () => goToSlide(currentIndex - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goToSlide(currentIndex + 1));

  dotsEl.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
  });

  thumbsEl.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', () => goToSlide(parseInt(thumb.dataset.index)));
  });

  // Swipe touch
  let startX = 0;
  const wrap = document.querySelector('.carousel-track-wrap');
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goToSlide(currentIndex + (diff > 0 ? 1 : -1));
  });
}

// ── PREENCHE OS DETALHES ──
function fillDetails(p) {
  document.title = `CavEnergys — ${p.name}`;

  document.getElementById('infoFlag').textContent        = p.flag;
  document.getElementById('infoCountry').textContent     = p.country_name;
  document.getElementById('infoTitle').textContent       = p.name;
  document.getElementById('infoPrice').textContent       = formatPrice(p.price, p.currency);
  document.getElementById('badgeCondition').textContent  = `✅ ${p.condition}`;
  document.getElementById('badgeCountry2').textContent   = `${p.flag} ${p.country_name}`;
  document.getElementById('infoDescription').textContent = p.description;
  document.getElementById('infoOrigin').textContent      = p.origin || '—';
  document.getElementById('infoDate').textContent        = formatDate(p.production_date);
  document.getElementById('infoCountryFull').textContent = `${p.flag} ${p.country_name}`;
  document.getElementById('infoCondition').textContent   = p.condition || '—';

  // Vídeo
  if (p.video) {
    document.getElementById('videoSource').src = p.video;
    document.getElementById('productVideo').load();
  } else {
    document.querySelector('.video-section').style.display = 'none';
  }

// Botão de interesse (exemplo: WhatsApp)
  document.getElementById('buyBtn').addEventListener('click', () => {
    const msg = encodeURIComponent(`Olá! Tenho interesse no produto: ${p.name} — R$ ${p.price.toFixed(2).replace('.', ',')}`);
    
    // Adicionado o seu número 55 (Brasil) + 19 (DDD) + número
    window.open(`https://wa.me/5519994828134?text=${msg}`, '_blank');
  });
}

// ── INIT ──
async function init() {
  const id = getProductId();

  if (!id) {
    showNotFound();
    return;
  }

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    const product = products.find(p => p.id === id);

    if (!product) {
      showNotFound();
      return;
    }

    // Usa images[] se existir, senão usa image
    const images = product.images?.length ? product.images : [product.image];

    buildCarousel(images);
    fillDetails(product);

    document.getElementById('skeleton').style.display = 'none';
    document.getElementById('productDetail').style.display = 'grid';

  } catch (err) {
    document.getElementById('skeleton').style.display = 'none';
    document.getElementById('notFound').style.display = 'flex';
    document.getElementById('notFound').querySelector('p').textContent =
      `Erro ao carregar: ${err.message}`;
  }
}

function showNotFound() {
  document.getElementById('skeleton').style.display = 'none';
  document.getElementById('notFound').style.display = 'flex';
}

init();
