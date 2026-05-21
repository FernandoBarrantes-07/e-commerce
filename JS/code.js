let productos = [];

async function cargarProductos() {
  try {
    const res = await fetch('js/productos.json');
    const data = await res.json();
    console.log('Productos cargados:', data); // ← agrega esta línea
    productos = data.productos;
    filtrar('todos');
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}


function renderProductos(filtro) {
  const grid = document.getElementById('productosGrid');
  const lista = filtro === 'todos' ? productos : productos.filter(p => p.cat === filtro);

  grid.innerHTML = lista.map(p => `
    <div class="producto-img">
  ${p.badge ? `<div class="producto-badge">${p.badge}</div>` : ''}
  <img src="${p.img}" alt="${p.nombre}">
</div>
      <div class="producto-body">
        <p class="producto-cat">${p.cat}</p>
        <p class="producto-nombre">${p.nombre}</p>
        <p class="producto-desc">${p.desc}</p>
        <div class="producto-footer">
          <span class="producto-precio">₡${p.precio}</span>
          <button class="agregar-btn" onclick="agregarAlCarrito(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderHero(filtro) {
  const grid = document.getElementById('hero-card');
  const lista = filtro === 'todos' ? productos : productos.filter(p => p.cat === filtro);

  grid.innerHTML = lista.map(p => `
    <div class="producto-img">
  ${p.badge ? `<div class="producto-badge">${p.badge}</div>` : ''}
  <img src="${p.img}" alt="${p.nombre}">
</div>
        <p class="hero-card-title">${p.nombre}</p>
        <p class="hero-card-price">${p.nombre}</p>
        <button class="agregar-btn" onclick="agregarAlCarrito(${p.id})">+</button>
      </div>
    </div>
  `).join('');
}


function filtrar(cat, btn) {
  if (btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderProductos(cat);
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
}

// Cargar productos al inicio
renderProductos('todos');


let carrito = [];

function abrirCarrito() {
  document.getElementById('carritoPanel').classList.add('abierto');
  document.getElementById('carritoOverlay').classList.add('abierto');
}

function cerrarCarrito() {
  document.getElementById('carritoPanel').classList.remove('abierto');
  document.getElementById('carritoOverlay').classList.remove('abierto');
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.qty++;
  } else {
    carrito.push({ ...producto, qty: 1 });
  }

  actualizarCarritoUI();
  mostrarNotif('✅ ' + producto.nombre + ' agregado');
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  // Contador del navbar
  const total = carrito.reduce((sum, p) => sum + p.qty, 0);
  document.getElementById('cartCount').textContent = total;

  // Total en pesos
  const monto = carrito.reduce((sum, p) => sum + p.precio * p.qty, 0);
  document.getElementById('carritoTotal').textContent = '$' + monto;

  // Items
  const container = document.getElementById('carritoItems');
  const vacio = document.getElementById('carritoVacio');

  // Limpiar items anteriores
  container.querySelectorAll('.carrito-item').forEach(el => el.remove());

  if (carrito.length === 0) {
    vacio.style.display = 'block';
  } else {
    vacio.style.display = 'none';
    carrito.forEach(item => {
      const div = document.createElement('div');
      div.className = 'carrito-item';
      div.innerHTML = `
        <div class="carrito-item-icon">
        <img src="${item.img}" alt="${item.nombre}">
        </div>
        <div class="carrito-item-info">
          <p class="carrito-item-nombre">${item.nombre} ${item.qty > 1 ? 'x' + item.qty : ''}</p>
          <p class="carrito-item-precio">$${item.precio * item.qty}</p>
        </div>
        <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${item.id})">✕</button>
      `;
      container.insertBefore(div, vacio);
    });
  }
}

function enviarWhatsApp() {
  if (carrito.length === 0) {
    mostrarNotif('⚠️ Agrega productos primero');
    return;
  }

  const monto = carrito.reduce((sum, p) => sum + p.precio * p.qty, 0);
  let mensaje = '¡Hola MAFA! Quiero hacer el siguiente pedido:\n\n';
  carrito.forEach(item => {
    mensaje += `• ${item.nombre} x${item.qty} — $${item.precio * item.qty}\n`;
  });
  mensaje += `\n*Total: ₡${monto}*\n\n¿Me pueden ayudar? 😊`;

  const url = 'https://wa.me/50685286669?text=' + encodeURIComponent(mensaje);
  window.open(url, '_blank');
}

function mostrarNotif(texto) {
  const notif = document.getElementById('notif');
  document.getElementById('notifTexto').textContent = texto;
  notif.classList.add('visible');
  setTimeout(() => notif.classList.remove('visible'), 2500);
}

// Iniciar
cargarProductos();
renderHero("camaras");