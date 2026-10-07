/**
 * SCRIPT GLOBAL FULL-STACK • SISTEMA "BLESSED" (TIENDA DE ROPA)
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Evaluación V (Semana 10) • Demo Day de Avance Funcional (Primer CRUD) y Costos TI
 * Docente: Prof. Eduardo Nieves
 * 
 * Implementa:
 * 1. Consumo Asíncrono de API REST (fetch + async/await) con persistencia en MySQL.
 * 2. Manejo estricto de los 3 Estados de Interfaz (Loading, Success, Error).
 * 3. Validación DTO en tiempo de captura y protección contra doble clic (disabled).
 * 4. Conexión de KPIs en vivo para el Dashboard.
 */

const API_BASE_URL = 'api/index.php';

// Estado global en memoria para reactividad local tras consultas
let prendasData = [];
let itemToDeleteId = null;
let itemToDeleteName = '';

document.addEventListener('DOMContentLoaded', () => {
  initMobileSidebar();
  initModals();
  initViewToggle();
  initCrudModule();
  initUsersModule();
  initAuthModule();
  checkAuthSession();
  initDashboardKpis();
  initSwatchCopy();
});

/* ==========================================================================
   1. MENÚ HAMBURGUESA Y SIDEBAR MÓVIL (< 768px)
   ========================================================================== */
function initMobileSidebar() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!hamburgerBtn || !sidebar) return;

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  hamburgerBtn.addEventListener('click', toggleSidebar);

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  const navLinks = sidebar.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });
}

/* ==========================================================================
   2. SISTEMA DE MODALES Y OVERLAYS
   ========================================================================== */
function initModals() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) closeModal(activeModal.id);
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   3. TOAST FLOTANTE CON TEMPORIZADOR EN SEGUNDOS VISIBLE
   ========================================================================== */
let toastTimeout;
let toastInterval;

function showToast(title, message, durationSec = 4, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  container.innerHTML = '';
  if (toastTimeout) clearTimeout(toastTimeout);
  if (toastInterval) clearInterval(toastInterval);

  let secondsLeft = durationSec;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
    : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  const colorIcon = type === 'success' ? '#16a34a' : (type === 'error' ? 'var(--color-danger)' : 'var(--brand-primary)');

  toast.innerHTML = `
    <div style="color: ${colorIcon}; flex-shrink: 0; margin-top: 2px;">
      ${iconSvg}
    </div>
    <div class="toast-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <span class="toast-title">${title}</span>
        <span class="toast-timer-badge" id="toastTimerBadge">${secondsLeft}s</span>
      </div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close-btn" onclick="this.closest('.toast').remove()">&times;</button>
    <div class="toast-progress-bar" id="toastProgressBar" style="transition: width 1s linear;"></div>
  `;

  container.appendChild(toast);

  const badge = toast.querySelector('#toastTimerBadge');
  const progressBar = toast.querySelector('#toastProgressBar');

  toastInterval = setInterval(() => {
    secondsLeft--;
    if (badge) badge.textContent = `${secondsLeft}s`;
    if (progressBar) {
      const percentage = (secondsLeft / durationSec) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    if (secondsLeft <= 0) {
      clearInterval(toastInterval);
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 1000);
}

/* ==========================================================================
   4. INTERCAMBIO DE VISTAS EN CRUD (CARDS GRID VS TABLA)
   ========================================================================== */
function initViewToggle() {
  const btnCards = document.getElementById('viewCardsBtn');
  const btnTable = document.getElementById('viewTableBtn');
  const cardsContainer = document.getElementById('clothingCardsView');
  const tableContainer = document.getElementById('clothingTableView');

  if (!btnCards || !btnTable || !cardsContainer || !tableContainer) return;

  btnCards.addEventListener('click', () => {
    btnCards.classList.add('active');
    btnTable.classList.remove('active');
    cardsContainer.style.display = 'grid';
    tableContainer.style.display = 'none';
  });

  btnTable.addEventListener('click', () => {
    btnTable.classList.add('active');
    btnCards.classList.remove('active');
    cardsContainer.style.display = 'none';
    tableContainer.style.display = 'block';
  });
}

/* ==========================================================================
   5. MÓDULO CRUD REACTIVO: CONSUMO ASÍNCRONO DE APIS & LOS 3 ESTADOS
   ========================================================================== */
function initCrudModule() {
  const cardsContainer = document.getElementById('clothingCardsView');
  if (!cardsContainer) return; // No estamos en crud.html

  // 1. Cargar prendas iniciales desde la API REST
  fetchPrendasFromApi();

  // 2. Conectar buscador y selector de categorías
  const searchInput = document.getElementById('crudSearchInput');
  const categoryFilter = document.getElementById('crudCategoryFilter');

  let debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchPrendasFromApi(categoryFilter ? categoryFilter.value : 'todas', searchInput.value);
      }, 300);
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      fetchPrendasFromApi(categoryFilter.value, searchInput ? searchInput.value : '');
    });
  }

  // 3. Conectar Formulario de Crear / Editar
  const crudForm = document.getElementById('crudItemForm');
  if (crudForm) {
    crudForm.addEventListener('submit', handleFormSubmit);
  }
}

/**
 * Consulta la API REST mediante fetch() y gestiona los 3 estados:
 * - Loading: activa spinner mientras la promesa está pendiente.
 * - Success: inyecta cards y tabla reactiva con feedback visual.
 * - Error: alerta legible ante fallos de red o de servidor.
 */
async function fetchPrendasFromApi(categoria = 'todas', busqueda = '') {
  const loadingEl = document.getElementById('crudLoadingState');
  const errorEl = document.getElementById('crudErrorState');
  const cardsEl = document.getElementById('clothingCardsView');
  const tableEl = document.getElementById('clothingTableView');
  const btnCards = document.getElementById('viewCardsBtn');
  const paginationInfo = document.getElementById('paginationInfo');

  // ESTADO 1: CARGANDO (LOADING)
  if (loadingEl) loadingEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';
  if (cardsEl) cardsEl.style.display = 'none';
  if (tableEl) tableEl.style.display = 'none';

  try {
    let url = `${API_BASE_URL}?route=prendas`;
    const params = new URLSearchParams();
    if (categoria && categoria !== 'todas') params.append('categoria', categoria);
    if (busqueda && busqueda.trim()) params.append('q', busqueda.trim());

    if (params.toString()) {
      url += '&' + params.toString();
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: Fallo en respuesta del servidor.`);
    }

    const result = await response.json();
    prendasData = result.data || [];

    // ESTADO 2: ÉXITO (SUCCESS)
    if (loadingEl) loadingEl.style.display = 'none';
    
    // Respetar la vista activa (Cards vs Tabla)
    const isTableView = document.getElementById('viewTableBtn')?.classList.contains('active');
    if (isTableView) {
      if (tableEl) tableEl.style.display = 'block';
      if (cardsEl) cardsEl.style.display = 'none';
    } else {
      if (cardsEl) cardsEl.style.display = 'grid';
      if (tableEl) tableEl.style.display = 'none';
    }

    renderPrendas(prendasData);

    if (paginationInfo) {
      paginationInfo.textContent = `Mostrando ${prendasData.length} prendas registradas en Base de Datos`;
    }

  } catch (error) {
    // ESTADO 3: ERROR HANDLING
    if (loadingEl) loadingEl.style.display = 'none';
    if (cardsEl) cardsEl.style.display = 'none';
    if (tableEl) tableEl.style.display = 'none';
    
    if (errorEl) {
      errorEl.style.display = 'block';
      const detailsEl = document.getElementById('crudErrorDetails');
      if (detailsEl) detailsEl.textContent = error.message || 'Verifique que Apache y MySQL estén activos en XAMPP.';
    }

    showToast('Fallo de Conexión', 'No se pudo sincronizar con la Base de Datos.', 4, 'error');
  }
}

/**
 * Renderiza dinámicamente las tarjetas (Cards) y filas de la tabla
 */
function renderPrendas(prendas) {
  const cardsContainer = document.getElementById('clothingCardsView');
  const tableBody = document.getElementById('clothingTableBody');

  if (cardsContainer) cardsContainer.innerHTML = '';
  if (tableBody) tableBody.innerHTML = '';

  if (prendas.length === 0) {
    const emptyMsg = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 0.75rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <h4>No se encontraron prendas con los criterios seleccionados</h4>
        <p style="font-size: 0.88rem;">Intente buscar con otro término o registre una nueva prenda.</p>
      </div>`;
    if (cardsContainer) cardsContainer.innerHTML = emptyMsg;
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No hay registros disponibles.</td></tr>`;
    return;
  }

  prendas.forEach(p => {
    // Badge de Stock
    let stockBadge = '<span class="badge badge-success">En Stock (' + p.stock_actual + ')</span>';
    if (p.stock_actual <= 0) {
      stockBadge = '<span class="badge badge-danger">Agotado</span>';
    } else if (p.stock_actual <= p.stock_minimo) {
      stockBadge = '<span class="badge badge-warning">Poco Stock (' + p.stock_actual + ')</span>';
    }

    // 1. Inyectar Card
    if (cardsContainer) {
      const card = document.createElement('div');
      card.className = 'clothing-card';
      card.setAttribute('data-id', p.id_prenda);
      card.setAttribute('data-title', p.nombre);
      card.setAttribute('data-sku', p.sku);
      card.setAttribute('data-category', p.categoria_codigo);

      card.innerHTML = `
        <div class="clothing-img-container">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5">
            <path d="M16 3l4 4-2 4-2-1v10H8V10L6 11 4 7l4-4h2a2 2 0 004 0h2z"/>
          </svg>
          <span class="clothing-sku-overlay">${escapeHtml(p.sku)}</span>
          <span class="clothing-badge-overlay">${stockBadge}</span>
        </div>
        <div class="clothing-body">
          <span class="clothing-category">${escapeHtml(p.categoria_nombre)}</span>
          <h3 class="clothing-title">${escapeHtml(p.nombre)}</h3>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem; color: var(--text-muted);">${escapeHtml(p.descripcion)}</p>
          <div class="clothing-details">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Precio Venta</div>
              <div class="clothing-price">$${parseFloat(p.precio_venta).toFixed(2)}</div>
            </div>
            <div class="clothing-actions">
              <button class="btn btn-secondary btn-sm" onclick="openEditModalById(${p.id_prenda})" title="Editar Prenda">
                <svg width="15" height="15" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="promptDelete(${p.id_prenda}, '${escapeQuotes(p.nombre)}')" title="Eliminar Prenda">
                <svg width="15" height="15" fill="none" stroke="var(--color-danger)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    }

    // 2. Inyectar Fila de Tabla
    if (tableBody) {
      const row = document.createElement('tr');
      row.setAttribute('data-id', p.id_prenda);
      row.innerHTML = `
        <td><code>${escapeHtml(p.sku)}</code></td>
        <td><strong>${escapeHtml(p.nombre)}</strong></td>
        <td>${escapeHtml(p.categoria_nombre)}</td>
        <td>${escapeHtml(p.tallas_disponibles)}</td>
        <td><strong>${p.stock_actual} unids</strong></td>
        <td><strong style="color: var(--brand-primary);">$${parseFloat(p.precio_venta).toFixed(2)}</strong></td>
        <td>${stockBadge}</td>
        <td>
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="openEditModalById(${p.id_prenda})" title="Editar Prenda">
              <svg width="15" height="15" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm" onclick="promptDelete(${p.id_prenda}, '${escapeQuotes(p.nombre)}')" title="Eliminar Prenda">
              <svg width="15" height="15" fill="none" stroke="var(--color-danger)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    }
  });
}

/* ==========================================================================
   6. OPERACIONES CRUD: CREAR, EDITAR Y ELIMINAR CON VALIDACIÓN Y PERSISTENCIA
   ========================================================================== */

function openCreateModal() {
  const modalTitle = document.getElementById('crudModalTitle');
  const form = document.getElementById('crudItemForm');
  const hiddenId = document.getElementById('itemIdInput');
  const errBox = document.getElementById('modalFormError');

  if (modalTitle) modalTitle.textContent = 'Registrar Nueva Prenda en Stock';
  if (hiddenId) hiddenId.value = '';
  if (errBox) errBox.style.display = 'none';
  if (form) form.reset();

  const submitText = document.getElementById('btnSubmitPrendaText');
  if (submitText) submitText.textContent = 'Guardar Registro';

  openModal('modalCrudUnified');
}

function openEditModalById(id) {
  const prenda = prendasData.find(item => Number(item.id_prenda) === Number(id));
  if (!prenda) return;

  const modalTitle = document.getElementById('crudModalTitle');
  const hiddenId = document.getElementById('itemIdInput');
  const inpTitle = document.getElementById('itemTitleInput');
  const inpSku = document.getElementById('itemSkuInput');
  const inpCat = document.getElementById('itemCategoryInput');
  const inpStock = document.getElementById('itemStockInput');
  const inpPrice = document.getElementById('itemPriceInput');
  const inpDesc = document.getElementById('itemDescInput');
  const errBox = document.getElementById('modalFormError');

  if (modalTitle) modalTitle.textContent = `Editar Prenda: ${prenda.nombre}`;
  if (hiddenId) hiddenId.value = prenda.id_prenda;
  if (inpTitle) inpTitle.value = prenda.nombre;
  if (inpSku) inpSku.value = prenda.sku;
  if (inpCat) inpCat.value = prenda.id_categoria;
  if (inpStock) inpStock.value = prenda.stock_actual;
  if (inpPrice) inpPrice.value = parseFloat(prenda.precio_venta).toFixed(2);
  if (inpDesc) inpDesc.value = prenda.descripcion || '';
  if (errBox) errBox.style.display = 'none';

  const submitText = document.getElementById('btnSubmitPrendaText');
  if (submitText) submitText.textContent = 'Actualizar Prenda';

  openModal('modalCrudUnified');
}

/**
 * Procesa el envío del formulario mediante POST o PUT con validaciones DTO
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const btnSubmit = document.getElementById('btnSubmitPrenda');
  const btnText = document.getElementById('btnSubmitPrendaText');
  const errBox = document.getElementById('modalFormError');
  const hiddenId = document.getElementById('itemIdInput');

  const id = hiddenId ? hiddenId.value : '';
  const isEditing = Boolean(id);

  const payload = {
    nombre: document.getElementById('itemTitleInput').value.trim(),
    sku: document.getElementById('itemSkuInput').value.trim(),
    id_categoria: parseInt(document.getElementById('itemCategoryInput').value),
    stock_actual: parseInt(document.getElementById('itemStockInput').value),
    precio_venta: parseFloat(document.getElementById('itemPriceInput').value),
    descripcion: document.getElementById('itemDescInput') ? document.getElementById('itemDescInput').value.trim() : ''
  };

  // Validación en cliente en tiempo de captura
  if (!payload.nombre || !payload.sku || isNaN(payload.precio_venta) || isNaN(payload.stock_actual)) {
    if (errBox) {
      errBox.textContent = 'Por favor complete todos los campos obligatorios marcados con (*).';
      errBox.style.display = 'block';
    }
    return;
  }

  // DESHABILITAR BOTÓN PARA EVITAR DUPLICADOS (REQUISITO OFICIAL)
  if (btnSubmit) btnSubmit.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="spinner-sm"></span> Procesando...';
  if (errBox) errBox.style.display = 'none';

  try {
    const url = isEditing 
      ? `${API_BASE_URL}?route=prendas&id=${id}`
      : `${API_BASE_URL}?route=prendas`;

    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || 'Error al guardar la prenda en el servidor.';
      throw new Error(errorMsg);
    }

    // ÉXITO
    closeModal('modalCrudUnified');
    showToast(
      isEditing ? 'Prenda Actualizada' : 'Prenda Registrada',
      `"${payload.nombre}" se persistió correctamente en la Base de Datos relacional.`,
      4,
      'success'
    );

    // Refresco automático de tablas
    await fetchPrendasFromApi();

  } catch (err) {
    if (errBox) {
      errBox.textContent = err.message;
      errBox.style.display = 'block';
    }
    showToast('Error de Validación', err.message, 4, 'error');
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = isEditing ? 'Actualizar Prenda' : 'Guardar Registro';
  }
}

/**
 * Modal de Confirmación de Eliminación
 */
function promptDelete(id, nombre) {
  itemToDeleteId = id;
  itemToDeleteName = nombre;
  const targetLabel = document.getElementById('deleteTargetName');
  if (targetLabel) {
    targetLabel.textContent = `"${nombre}"`;
  }
  openModal('modalConfirmDelete');
}

async function confirmDeleteAction() {
  if (!itemToDeleteId) return;

  const btnDelete = document.getElementById('btnConfirmDelete');
  const btnText = document.getElementById('btnConfirmDeleteText');

  if (btnDelete) btnDelete.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="spinner-sm"></span> Eliminando...';

  try {
    const response = await fetch(`${API_BASE_URL}?route=prendas&id=${itemToDeleteId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'No se pudo eliminar el registro.');
    }

    closeModal('modalConfirmDelete');
    showToast('Prenda Eliminada', `El registro de "${itemToDeleteName}" fue eliminado físicamente de la Base de Datos.`, 4, 'success');

    itemToDeleteId = null;
    itemToDeleteName = '';

    // Refresco automático
    await fetchPrendasFromApi();

  } catch (err) {
    showToast('Fallo al Eliminar', err.message, 4, 'error');
  } finally {
    if (btnDelete) btnDelete.disabled = false;
    if (btnText) btnText.textContent = 'Sí, Eliminar';
  }
}

/* ==========================================================================
   7. DASHBOARD: CONEXIÓN DE KPIS EN VIVO CON LA BASE DE DATOS
   ========================================================================== */
async function initDashboardKpis() {
  const stockEl = document.getElementById('kpiStockTotal');
  if (!stockEl) return; // No estamos en dashboard.html

  try {
    const response = await fetch(`${API_BASE_URL}?route=kpis`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) return;

    const res = await response.json();
    const kpis = res.data;

    if (kpis) {
      const elStock = document.getElementById('kpiStockTotal');
      const elValor = document.getElementById('kpiValorInventario');
      const elModelos = document.getElementById('kpiTotalModelos');
      const elBajo = document.getElementById('kpiStockBajo');

      if (elStock) elStock.textContent = `${kpis.stock_total} unids`;
      if (elValor) elValor.textContent = `$${parseFloat(kpis.valor_inventario).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      if (elModelos) elModelos.textContent = `${kpis.total_modelos} Refs.`;
      if (elBajo) elBajo.textContent = `${kpis.alerta_stock_bajo} ${parseInt(kpis.alerta_stock_bajo) === 1 ? 'Ref.' : 'Refs.'}`;
    }
  } catch (e) {
    console.warn('Dashboard KPIs: usando valores precargados.', e);
  }
}

/* ==========================================================================
   8. UTILIDADES
   ========================================================================== */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function initSwatchCopy() {
  const swatches = document.querySelectorAll('.color-swatch-card');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const hex = swatch.getAttribute('data-hex');
      if (hex) {
        navigator.clipboard.writeText(hex).then(() => {
          showToast('Color Copiado', `Código HEX ${hex} copiado al portapapeles.`, 3, 'success');
        }).catch(() => {
          showToast('Color Seleccionado', `${hex}`, 3, 'info');
        });
      }
    });
  });
}

/* ==========================================================================
   9. MÓDULO DE GESTIÓN DE PERFILES Y ROLES (usuarios.html)
   ========================================================================== */
let usuariosData = [];
let userToDeleteId = null;
let userToDeleteName = '';

function initUsersModule() {
  const userCardsContainer = document.getElementById('userCardsView');
  if (!userCardsContainer) return; // No estamos en usuarios.html

  // 1. Cargar usuarios desde la API
  fetchUsuariosFromApi();

  // 2. Conectar buscador y filtro de roles
  const searchInput = document.getElementById('userSearchInput');
  const roleFilter = document.getElementById('userRoleFilter');

  let debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchUsuariosFromApi(roleFilter ? roleFilter.value : 'todos', searchInput.value);
      }, 300);
    });
  }

  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      fetchUsuariosFromApi(roleFilter.value, searchInput ? searchInput.value : '');
    });
  }

  // 3. Conectar intercambio de vistas (Cards vs Tabla)
  const btnCards = document.getElementById('viewUserCardsBtn');
  const btnTable = document.getElementById('viewUserTableBtn');
  const cardsContainer = document.getElementById('userCardsView');
  const tableContainer = document.getElementById('userTableView');

  if (btnCards && btnTable && cardsContainer && tableContainer) {
    btnCards.addEventListener('click', () => {
      btnCards.classList.add('active');
      btnTable.classList.remove('active');
      cardsContainer.style.display = 'grid';
      tableContainer.style.display = 'none';
    });

    btnTable.addEventListener('click', () => {
      btnTable.classList.add('active');
      btnCards.classList.remove('active');
      cardsContainer.style.display = 'none';
      tableContainer.style.display = 'block';
    });
  }

  // 4. Formulario de Perfiles
  const userForm = document.getElementById('userForm');
  if (userForm) {
    userForm.addEventListener('submit', handleUserFormSubmit);
  }
}

async function fetchUsuariosFromApi(rol = 'todos', busqueda = '') {
  const loadingEl = document.getElementById('usersLoadingState');
  const errorEl = document.getElementById('usersErrorState');
  const cardsEl = document.getElementById('userCardsView');
  const tableEl = document.getElementById('userTableView');
  const paginationInfo = document.getElementById('usersPaginationInfo');

  if (loadingEl) loadingEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';
  if (cardsEl) cardsEl.style.display = 'none';
  if (tableEl) tableEl.style.display = 'none';

  try {
    let url = `${API_BASE_URL}?route=usuarios`;
    const params = new URLSearchParams();
    if (rol && rol !== 'todos') params.append('rol', rol);
    if (busqueda && busqueda.trim()) params.append('q', busqueda.trim());

    if (params.toString()) {
      url += '&' + params.toString();
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: Fallo al consultar usuarios.`);
    }

    const result = await response.json();
    usuariosData = result.data || [];

    if (loadingEl) loadingEl.style.display = 'none';

    const isTableView = document.getElementById('viewUserTableBtn')?.classList.contains('active');
    if (isTableView) {
      if (tableEl) tableEl.style.display = 'block';
      if (cardsEl) cardsEl.style.display = 'none';
    } else {
      if (cardsEl) cardsEl.style.display = 'grid';
      if (tableEl) tableEl.style.display = 'none';
    }

    renderUsuarios(usuariosData);

    if (paginationInfo) {
      paginationInfo.textContent = `Mostrando ${usuariosData.length} perfiles activos en Base de Datos`;
    }

  } catch (error) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (cardsEl) cardsEl.style.display = 'none';
    if (tableEl) tableEl.style.display = 'none';

    if (errorEl) {
      errorEl.style.display = 'block';
      const detailsEl = document.getElementById('usersErrorDetails');
      if (detailsEl) detailsEl.textContent = error.message;
    }

    showToast('Error de Perfiles', 'No se pudieron consultar los usuarios de la base de datos.', 4, 'error');
  }
}

function renderUsuarios(usuarios) {
  const cardsContainer = document.getElementById('userCardsView');
  const tableBody = document.getElementById('userTableBody');

  if (cardsContainer) cardsContainer.innerHTML = '';
  if (tableBody) tableBody.innerHTML = '';

  if (usuarios.length === 0) {
    const emptyMsg = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 0.75rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <h4>No se encontraron perfiles con los filtros especificados</h4>
        <p style="font-size: 0.88rem;">Intente buscar con otro nombre o registre un nuevo perfil.</p>
      </div>`;
    if (cardsContainer) cardsContainer.innerHTML = emptyMsg;
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No hay usuarios registrados.</td></tr>`;
    return;
  }

  usuarios.forEach(u => {
    // Iniciales para avatar
    const initials = u.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    
    // Badge de Rol
    const isSuperAdmin = Number(u.id_usuario) === 1;
    const isAdmin = u.rol_codigo === 'admin';
    const roleBadge = isAdmin
      ? '<span class="badge badge-brand" style="font-size: 0.72rem;"><svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> ADMIN</span>'
      : '<span class="badge badge-success" style="font-size: 0.72rem;"><svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg> CLIENTE COMPRADOR</span>';

    // 1. Cards
    if (cardsContainer) {
      const card = document.createElement('div');
      card.className = 'clothing-card';
      card.innerHTML = `
        <div style="background: linear-gradient(135deg, ${isAdmin ? 'var(--brand-dark)' : '#1e3a8a'}, #0f172a); padding: 1.75rem 1.25rem; display: flex; align-items: center; gap: 1rem; color: #fff;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: ${isAdmin ? 'var(--brand-primary)' : '#2563eb'}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #fff; box-shadow: var(--shadow-md);">
            ${initials}
          </div>
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em;">ID #${u.id_usuario}</div>
            <h3 style="margin: 0; font-size: 1.15rem; color: #ffffff;">${escapeHtml(u.nombre_completo)}</h3>
            <div style="margin-top: 0.35rem;">${roleBadge}</div>
          </div>
        </div>
        <div class="clothing-body" style="padding: 1.25rem;">
          <div style="font-size: 0.85rem; margin-bottom: 0.5rem;">
            <strong style="color: var(--text-main);">Correo:</strong> 
            <a href="mailto:${escapeHtml(u.email)}" style="color: var(--brand-primary); text-decoration: none;">${escapeHtml(u.email)}</a>
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 0.75rem; color: var(--text-muted);">
            <strong>Teléfono:</strong> ${escapeHtml(u.telefono || 'No registrado')}
          </div>
          <div class="clothing-details" style="padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
            <div>
              <span class="badge ${u.estado === 'activo' ? 'badge-success' : 'badge-warning'}">${u.estado === 'activo' ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div class="clothing-actions">
              <button class="btn btn-secondary btn-sm" onclick="openEditUserModalById(${u.id_usuario})" title="Editar Perfil">
                <svg width="15" height="15" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              ${!isSuperAdmin ? `
              <button class="btn btn-secondary btn-sm" onclick="promptDeleteUser(${u.id_usuario}, '${escapeQuotes(u.nombre_completo)}')" title="Eliminar Usuario">
                <svg width="15" height="15" fill="none" stroke="var(--color-danger)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>` : ''}
            </div>
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    }

    // 2. Tabla
    if (tableBody) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><code>#${u.id_usuario}</code></td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isAdmin ? 'var(--brand-primary)' : '#2563eb'}; color: #fff; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">${initials}</div>
            <strong>${escapeHtml(u.nombre_completo)}</strong>
          </div>
        </td>
        <td>${escapeHtml(u.email)}</td>
        <td>${roleBadge}</td>
        <td>${escapeHtml(u.telefono || '-')}</td>
        <td><span class="badge ${u.estado === 'activo' ? 'badge-success' : 'badge-warning'}">${u.estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="openEditUserModalById(${u.id_usuario})" title="Editar Perfil">
              <svg width="15" height="15" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            ${!isSuperAdmin ? `
            <button class="btn btn-secondary btn-sm" onclick="promptDeleteUser(${u.id_usuario}, '${escapeQuotes(u.nombre_completo)}')" title="Eliminar Usuario">
              <svg width="15" height="15" fill="none" stroke="var(--color-danger)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>` : ''}
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    }
  });
}

function openCreateUserModal() {
  const modalTitle = document.getElementById('userModalTitle');
  const form = document.getElementById('userForm');
  const hiddenId = document.getElementById('userIdInput');
  const errBox = document.getElementById('userModalError');
  const passHelp = document.getElementById('userPassHelp');
  const passInput = document.getElementById('userPassInput');

  if (modalTitle) modalTitle.textContent = 'Registrar Nuevo Perfil de Usuario';
  if (hiddenId) hiddenId.value = '';
  if (errBox) errBox.style.display = 'none';
  if (passHelp) passHelp.style.display = 'none';
  if (passInput) passInput.required = true;
  if (form) form.reset();

  const submitText = document.getElementById('btnSubmitUserText');
  if (submitText) submitText.textContent = 'Guardar Perfil';

  openModal('modalUserUnified');
}

function openEditUserModalById(id) {
  const user = usuariosData.find(item => Number(item.id_usuario) === Number(id));
  if (!user) return;

  const modalTitle = document.getElementById('userModalTitle');
  const hiddenId = document.getElementById('userIdInput');
  const inpName = document.getElementById('userNameInput');
  const inpEmail = document.getElementById('userEmailInput');
  const inpRole = document.getElementById('userRoleInput');
  const inpStatus = document.getElementById('userStatusInput');
  const inpPhone = document.getElementById('userPhoneInput');
  const passHelp = document.getElementById('userPassHelp');
  const passInput = document.getElementById('userPassInput');
  const errBox = document.getElementById('userModalError');

  if (modalTitle) modalTitle.textContent = `Editar Perfil: ${user.nombre_completo}`;
  if (hiddenId) hiddenId.value = user.id_usuario;
  if (inpName) inpName.value = user.nombre_completo;
  if (inpEmail) inpEmail.value = user.email;
  if (inpRole) inpRole.value = user.id_rol;
  if (inpStatus) inpStatus.value = user.estado;
  if (inpPhone) inpPhone.value = user.telefono || '';
  if (passHelp) passHelp.style.display = 'block';
  if (passInput) {
    passInput.required = false;
    passInput.value = '';
  }
  if (errBox) errBox.style.display = 'none';

  const submitText = document.getElementById('btnSubmitUserText');
  if (submitText) submitText.textContent = 'Actualizar Perfil';

  openModal('modalUserUnified');
}

async function handleUserFormSubmit(event) {
  event.preventDefault();

  const btnSubmit = document.getElementById('btnSubmitUser');
  const btnText = document.getElementById('btnSubmitUserText');
  const errBox = document.getElementById('userModalError');
  const hiddenId = document.getElementById('userIdInput');

  const id = hiddenId ? hiddenId.value : '';
  const isEditing = Boolean(id);

  const payload = {
    nombre_completo: document.getElementById('userNameInput').value.trim(),
    email: document.getElementById('userEmailInput').value.trim(),
    id_rol: parseInt(document.getElementById('userRoleInput').value),
    estado: document.getElementById('userStatusInput').value,
    telefono: document.getElementById('userPhoneInput').value.trim()
  };

  const passVal = document.getElementById('userPassInput').value;
  if (passVal) {
    payload.password = passVal;
  }

  if (btnSubmit) btnSubmit.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="spinner-sm"></span> Procesando...';
  if (errBox) errBox.style.display = 'none';

  try {
    const url = isEditing 
      ? `${API_BASE_URL}?route=usuarios&id=${id}`
      : `${API_BASE_URL}?route=usuarios`;

    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al guardar el usuario.');
    }

    closeModal('modalUserUnified');
    showToast(
      isEditing ? 'Perfil Actualizado' : 'Perfil Creado',
      `El usuario "${payload.nombre_completo}" se guardó correctamente.`,
      4,
      'success'
    );

    await fetchUsuariosFromApi();

  } catch (err) {
    if (errBox) {
      errBox.textContent = err.message;
      errBox.style.display = 'block';
    }
    showToast('Fallo al Guardar', err.message, 4, 'error');
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
    if (btnText) btnText.textContent = isEditing ? 'Actualizar Perfil' : 'Guardar Perfil';
  }
}

function promptDeleteUser(id, nombre) {
  userToDeleteId = id;
  userToDeleteName = nombre;
  const targetLabel = document.getElementById('deleteUserNameTarget');
  if (targetLabel) {
    targetLabel.textContent = `"${nombre}"`;
  }
  openModal('modalConfirmDeleteUser');
}

async function confirmDeleteUserAction() {
  if (!userToDeleteId) return;

  const btnDelete = document.getElementById('btnConfirmDeleteUser');
  const btnText = document.getElementById('btnConfirmDeleteUserText');

  if (btnDelete) btnDelete.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="spinner-sm"></span> Eliminando...';

  try {
    const response = await fetch(`${API_BASE_URL}?route=usuarios&id=${userToDeleteId}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'No se pudo eliminar el usuario.');
    }

    closeModal('modalConfirmDeleteUser');
    showToast('Usuario Eliminado', `El perfil de "${userToDeleteName}" fue dado de baja correctamente.`, 4, 'success');

    userToDeleteId = null;
    userToDeleteName = '';

    await fetchUsuariosFromApi();

  } catch (err) {
    showToast('Fallo al Eliminar', err.message, 4, 'error');
  } finally {
    if (btnDelete) btnDelete.disabled = false;
    if (btnText) btnText.textContent = 'Sí, Eliminar';
  }
}

/* ==========================================================================
   10. MÓDULO DE AUTENTICACIÓN: LOGIN Y REGISTRO REACTIVO
   ========================================================================== */
function initAuthModule() {
  const currentPath = window.location.pathname.split('/').pop().toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);

  // 1. Detección de Notificaciones de Seguridad en login.html
  if (currentPath === 'login.html' || currentPath === '') {
    const noticeEl = document.getElementById('authSecurityNotice');
    const noticeTitle = document.getElementById('authNoticeTitle');
    const noticeMsg = document.getElementById('authNoticeMsg');

    if (urlParams.get('security_block') === 'unauthorized') {
      const fromPage = urlParams.get('from') || sessionStorage.getItem('blessed_target_url') || 'el módulo solicitado';
      if (noticeEl) {
        noticeEl.style.display = 'block';
        if (noticeTitle) noticeTitle.textContent = '🔒 Filtro de Seguridad Activo (Acceso Restringido)';
        if (noticeMsg) {
          noticeMsg.textContent = `Intentó acceder directamente a "${fromPage}" sin autenticación. Por favor inicie sesión con su usuario y contraseña para continuar.`;
        }
      }
      showToast('Acceso Denegado', `Debe iniciar sesión para ingresar a ${fromPage}.`, 4, 'error');
    } else if (urlParams.get('logout') === '1') {
      if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.style.background = 'rgba(16, 185, 129, 0.12)';
        noticeEl.style.borderColor = 'var(--state-success)';
        noticeEl.style.color = '#6ee7b7';
        if (noticeTitle) {
          noticeTitle.textContent = '✓ Sesión Finalizada';
          noticeTitle.style.color = '#ffffff';
        }
        if (noticeMsg) noticeMsg.textContent = 'Ha cerrado su sesión de forma segura. Puede volver a ingresar cuando lo desee.';
      }
      showToast('Sesión Finalizada', 'Su sesión fue cerrada correctamente.', 3, 'info');
    }
  }

  // 2. Manejo del Formulario de Login (login.html)
  const loginForm = document.querySelector('form[action="dashboard.html"]');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('usernameInput');
      const passwordInput = document.getElementById('passwordInput');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!usernameInput || !passwordInput) return;

      const email = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showToast('Campos Incompletos', 'Por favor ingrese su usuario y contraseña.', 3, 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-sm"></span> Verificando Credenciales...';
      }

      try {
        const response = await fetch(`${API_BASE_URL}?route=login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Credenciales inválidas.');
        }

        // Guardar usuario en localStorage
        localStorage.setItem('blessed_user', JSON.stringify(result.data.usuario));

        // Determinar destino (respetar si intentaba entrar a crud.html o usuarios.html)
        const targetUrl = sessionStorage.getItem('blessed_target_url');
        sessionStorage.removeItem('blessed_target_url');

        // Si es cliente y quería ir a usuarios.html, dirigir a dashboard
        let finalDestination = result.data.redirect || 'dashboard.html';
        if (targetUrl) {
          if (targetUrl.includes('usuarios.html') && result.data.usuario.rol_codigo !== 'admin') {
            finalDestination = 'dashboard.html';
          } else {
            finalDestination = targetUrl;
          }
        }

        showToast(
          '¡Acceso Autorizado!',
          `Bienvenido ${result.data.usuario.nombre_completo} (${result.data.usuario.rol_nombre}).`,
          3,
          'success'
        );

        setTimeout(() => {
          window.location.href = finalDestination;
        }, 1100);

      } catch (err) {
        showToast('Filtro de Seguridad', err.message, 4, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg> Ingresar al Sistema`;
        }
      }
    });
  }

  // 3. Manejo del Formulario de Registro (registro.html)
  const regForm = document.querySelector('form[action="login.html"]');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInp = document.getElementById('fullNameInput');
      const emailInp = document.getElementById('emailInput');
      const passInp = document.getElementById('regPassInput');
      const confirmInp = document.getElementById('regPassConfirmInput') || document.getElementById('regPassConfirm');
      const phoneInp = document.getElementById('phoneInput');
      const submitBtn = regForm.querySelector('button[type="submit"]');

      if (!passInp || !confirmInp) return;

      if (passInp.value !== confirmInp.value) {
        showToast('Error de Contraseña', 'Las contraseñas ingresadas no coinciden.', 4, 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-sm"></span> Registrando cuenta...';
      }

      try {
        const response = await fetch(`${API_BASE_URL}?route=registro`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            nombre_completo: nameInp.value.trim(),
            email: emailInp.value.trim(),
            password: passInp.value,
            telefono: phoneInp ? phoneInp.value.trim() : ''
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Fallo al registrar la cuenta.');
        }

        showToast('Cuenta Creada', '¡Registro exitoso! Redirigiendo a inicio de sesión...', 4, 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);

      } catch (err) {
        showToast('Error de Registro', err.message, 4, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg> Crear mi Cuenta`;
        }
      }
    });
  }
}

/* ==========================================================================
   11. CONTROL DE SESIÓN, ROLES Y LOGOUT
   ========================================================================== */
function checkAuthSession() {
  const currentPath = window.location.pathname.split('/').pop().toLowerCase();
  const storedUser = localStorage.getItem('blessed_user');

  // Si estamos en dashboard y venimos de un bloqueo de rol
  const roleAlert = sessionStorage.getItem('blessed_security_alert');
  if (roleAlert) {
    sessionStorage.removeItem('blessed_security_alert');
    setTimeout(() => {
      showToast('Permisos Insuficientes', roleAlert, 5, 'error');
    }, 400);
  }

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const nameEl = document.getElementById('sidebarUserName');
      const roleEl = document.getElementById('sidebarUserRole');
      const avatarEl = document.getElementById('sidebarAvatar');

      if (nameEl) nameEl.textContent = user.nombre_completo;
      if (roleEl) roleEl.textContent = user.rol_nombre || (user.rol_codigo === 'admin' ? 'Administrador del Sistema' : 'Cliente Comprador');
      if (avatarEl) {
        avatarEl.textContent = user.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      }

      // Control de visibilidad RBAC en Sidebar y Vistas
      applyRolePermissions(user);

    } catch (e) {
      console.warn('Error leyendo usuario de sesión.', e);
    }
  }
}

/**
 * Control de permisos según el Rol (admin vs cliente-comprador)
 */
function applyRolePermissions(user) {
  const isCliente = user && user.rol_codigo === 'cliente-comprador';

  if (isCliente) {
    // 1. Ocultar enlace de Gestión de Perfiles
    const usuariosLinks = document.querySelectorAll('a[href="usuarios.html"]');
    usuariosLinks.forEach(link => {
      link.style.display = 'none';
    });

    // 2. En crud.html: deshabilitar o esconder botón de crear prenda
    const btnCrearPrenda = document.querySelector('button[onclick="openCreateModal()"]');
    if (btnCrearPrenda) {
      btnCrearPrenda.style.display = 'none';
    }

    // 3. Modificar título o badge de navegación
    const roleBadge = document.getElementById('sidebarUserRole');
    if (roleBadge) {
      roleBadge.textContent = 'Cliente Comprador (Solo Lectura)';
    }
  }
}

/**
 * Cierre de sesión seguro con limpieza de almacenamiento
 */
function logoutUser(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  localStorage.removeItem('blessed_user');
  sessionStorage.removeItem('blessed_target_url');
  sessionStorage.removeItem('blessed_security_msg');
  sessionStorage.removeItem('blessed_security_alert');

  showToast('Cerrando Sesión', 'Redirigiendo a pantalla de acceso...', 2, 'info');

  setTimeout(() => {
    window.location.href = 'login.html?logout=1';
  }, 400);
}

