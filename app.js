/**
 * Checklist de Inspección de Guardia - Operaciones & Servicios
 * Manejo de estado, renderizado dinámico por pisos (Sube/Baja), firmas y modal.
 */

// Estructura predefinida de Pisos y Tareas de Operaciones
const DEFAULT_FLOORS_DATA = [
    {
        id: "piso-sotano",
        name: "Sótano / Cuartos de Máquinas",
        badge: "Nivel -1",
        order: 1,
        items: [
            { id: "sot-bomba-1", category: "Bombas de Agua", title: "Sistema de Bombas de Agua & Hidroneumático", desc: "Verificar presión de trabajo (PSI), ausencia de fugas y tableros de control en automático." },
            { id: "sot-tablero-1", category: "Tableros Eléctricos", title: "Tablero Eléctrico Principal de Sótano", desc: "Comprobar que no existan breakers disparados, calentamiento anormal ni ruidos térmicos." },
            { id: "sot-gas-1", category: "Llaves de Gas y Agua", title: "Llaves y Válvulas Generales de Gas y Agua", desc: "Verificar llaves de paso principales cerradas o en posición de seguridad." },
            { id: "sot-aire-1", category: "Aires Centrales", title: "Unidades de Extracción y Ventilación Mecánica", desc: "Revisar funcionamiento de extractores de sótano y flujo de aire constante." },
            { id: "sot-evac-1", category: "Vías de Evacuación", title: "Salidas de Emergencia y Pasillos de Sótano", desc: "Verificar puertas ignífugas cerradas, despejadas de obstáculos y luces de emergencia activas." },
            { id: "sot-mat-1", category: "Material Publicitario", title: "Depósito de Material Publicitario & POP", desc: "Verificar port pendones, tótems móviles y stands guardados bajo llave." }
        ]
    },
    {
        id: "piso-pb",
        name: "Planta Baja / Hall Principal & Vitrinas",
        badge: "Planta Baja",
        order: 2,
        items: [
            { id: "pb-luz-1", category: "Luces Perimetrales", title: "Iluminación Perimetral Externa y Accesos", desc: "Verificar encendido/apagado correcto de luminarias nocturnas y fotoceldas." },
            { id: "pb-pantalla-1", category: "Pantallas y Avisos", title: "Pantallas Publicitarias y Tótems Digitales", desc: "Comprobar pantallas encendidas con transmisión de contenido o apagadas según horario." },
            { id: "pb-vitrina-1", category: "Luces Perimetrales", title: "Iluminación de Vitrinas y Fachada Principal", desc: "Revisar avisos luminosos, marquesinas y vitrinas comerciales encendidas según programación." },
            { id: "pb-evac-1", category: "Vías de Evacuación", title: "Acceso Principal y Salidas de Emergencia PB", desc: "Puertas principales con cerrojo de seguridad nocturno/feriado y rutas despejadas." },
            { id: "pb-tablero-1", category: "Tableros Eléctricos", title: "Tablero de Iluminación y Servicios PB", desc: "Inspeccionar interruptores en posición norma y paneles cerrados con llave." },
            { id: "pb-mat-1", category: "Material Publicitario", title: "Resguardo de Banners y Material de Fachada", desc: "Confirmar que no haya material publicitario exterior expuesto al viento o lluvias." }
        ]
    },
    {
        id: "piso-1",
        name: "Piso 1 - Locales & Pasillos Comunes",
        badge: "Piso 1",
        order: 3,
        items: [
            { id: "p1-aire-1", category: "Aires Centrales", title: "Unidad Manejadora de Aire (UMA) Piso 1", desc: "Revisar temperatura ambiental, ausencia de botes de condensado y ruido regular." },
            { id: "p1-tablero-1", category: "Tableros Eléctricos", title: "Tableros Secundarios de Iluminación Piso 1", desc: "Inspección visual de breakers de pasillo y circuitos de servicios." },
            { id: "p1-pantalla-1", category: "Pantallas y Avisos", title: "Directorios Digitales y Avisos Luminosos", desc: "Comprobar estado de pantallas indicadoras de directorio y marquesinas." },
            { id: "p1-evac-1", category: "Vías de Evacuación", title: "Mangueras / Extintores y Luces de Salida", desc: "Gabinetes contra incendio cerrados, extintores con carga vigente y luces de salida operativas." },
            { id: "p1-gas-1", category: "Llaves de Gas y Agua", title: "Llaves de Corte de Agua en Baños de Piso 1", desc: "Inspeccionar baños de visitantes sin botes continuos ni llaves abiertas." }
        ]
    },
    {
        id: "piso-2",
        name: "Piso 2 - Oficinas Administrativas & IT",
        badge: "Piso 2",
        order: 4,
        items: [
            { id: "p2-aire-1", category: "Aires Centrales", title: "Climatización de Oficinas y Servidores IT", desc: "Verificar termostatos a temperatura adecuada y equipos centrales en modo guardia." },
            { id: "p2-tablero-1", category: "Tableros Eléctricos", title: "Tableros Eléctricos de Fuerza y Computación", desc: "Verificar llaves térmicas de energía regulada y tableros bajo llave." },
            { id: "p2-evac-1", category: "Vías de Evacuación", title: "Escaleras de Evacuación Internas", desc: "Pasillos y escaleras de escape libres de cajas, muebles u obstrucciones." },
            { id: "p2-gas-1", category: "Llaves de Gas y Agua", title: "Llaves de Agua en Kitchenette y Sanitarios", desc: "Verificar grifos cerrados en áreas de descanso y cafetería." }
        ]
    },
    {
        id: "piso-3",
        name: "Piso 3 - Operaciones & Salón de Eventos",
        badge: "Piso 3",
        order: 5,
        items: [
            { id: "p3-pantalla-1", category: "Pantallas y Avisos", title: "Pantallas de Promoción y Eventos", desc: "Comprobar proyectores y pantallas de señalización digital apagados/standby." },
            { id: "p3-mat-1", category: "Material Publicitario", title: "Backings y Escenografías Publicitarias", desc: "Verificar estandartes y elementos de escenografía asegurados correctamente." },
            { id: "p3-tablero-1", category: "Tableros Eléctricos", title: "Tablero de Conexiones de Eventos", desc: "Confirmar que breakers de tomas especiales estén desenergizados." },
            { id: "p3-evac-1", category: "Vías de Evacuación", title: "Puertas de Salida a Escalera de Servicio", desc: "Verificar mecanismo antipánico de puertas de evacuación." }
        ]
    },
    {
        id: "piso-terraza",
        name: "Terraza / Techo - Equipos Centrales",
        badge: "Terraza",
        order: 6,
        items: [
            { id: "ter-aire-1", category: "Aires Centrales", title: "Chillers & Condensadoras Principales", desc: "Inspeccionar unidades exteriores de aire acondicionado central, presiones y vibración." },
            { id: "ter-luz-1", category: "Luces Perimetrales", title: "Avisos Corpóreos e Iluminación de Techo", desc: "Verificar aviso principal de fachada en techo, reflectores y balizas de señalización aérea." },
            { id: "ter-evac-1", category: "Vías de Evacuación", title: "Acceso y Escotilla a la Terraza", desc: "Puerta de acceso a terraza cerrada con candado o cerradura de seguridad." },
            { id: "ter-gas-1", category: "Llaves de Gas y Agua", title: "Estación de Tanques de Agua e Hidrantes", desc: "Verificar tanques superiores, boyas de nivel y llaves matrices de corte." }
        ]
    }
];

// Estado global de la aplicación
let appState = {
    currentRecordId: null, // ID de la guardia del historial cargada en pantalla
    guardName: "",
    shiftType: "Fin de Semana - Diurno",
    inspectionDate: new Date().toISOString().slice(0, 16),
    buildingName: "Sede Principal - Edificio Operativo",
    direction: "up",
    categoryFilter: "all",
    responses: {} // { itemId: { status: 'ok'|'issue'|'na', severity: '', notes: '', image: '' } }
};

// Referencias del DOM
const elGuardName = document.getElementById("guard-name");
const elShiftType = document.getElementById("shift-type");
const elInspectionDate = document.getElementById("inspection-date");
const elBuildingName = document.getElementById("building-name");
const elCategoryFilter = document.getElementById("category-filter");
const elFloorsContainer = document.getElementById("floors-container");

// Nuevas referencias para imágenes
const elModalImage = document.getElementById("modal-image");
const elFileUploadName = document.getElementById("file-upload-name");
const elImagePreviewContainer = document.getElementById("modal-image-preview-container");
const elImagePreview = document.getElementById("modal-image-preview");
const elBtnRemoveImage = document.getElementById("btn-remove-image");

// Nuevas referencias para Historial
const elBtnHistory = document.getElementById("btn-history");
const elBtnSaveShift = document.getElementById("btn-save-shift");
const elHistoryBackdrop = document.getElementById("history-backdrop");
const elHistoryDrawer = document.getElementById("history-drawer");
const elBtnCloseHistory = document.getElementById("btn-close-history");
const elHistoryDateFilter = document.getElementById("history-date-filter");
const elBtnClearDateFilter = document.getElementById("btn-clear-date-filter");
const elHistoryListContainer = document.getElementById("history-list-container");

// Nuevas referencias para Visor de Imagen Ampliada
const elModalImageViewer = document.getElementById("modal-image-viewer");
const elViewerTitle = document.getElementById("viewer-title");
const elViewerImg = document.getElementById("viewer-img");
const elBtnCloseViewer = document.getElementById("btn-close-viewer");

// Variable temporal para Base64 de imagen adjuntada en modal
let tempAttachedImageBase64 = null;

// Métricas DOM
const elValProgress = document.getElementById("val-progress");
const elBarProgress = document.getElementById("bar-progress");
const elValOk = document.getElementById("val-ok");
const elValIssue = document.getElementById("val-issue");
const elValNa = document.getElementById("val-na");

// Modal DOM
const elModal = document.getElementById("modal-observation");
const elModalItemId = document.getElementById("modal-item-id");
const elModalTitle = document.getElementById("modal-item-title");
const elModalSeverity = document.getElementById("modal-severity");
const elModalNotes = document.getElementById("modal-notes");

// Inicialización al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
    loadSavedState();
    setupEventListeners();
    renderAll();
});

// Guardar y Cargar en LocalStorage
function saveState() {
    appState.guardName = elGuardName.value;
    appState.shiftType = elShiftType.value;
    appState.inspectionDate = elInspectionDate.value;
    appState.buildingName = elBuildingName.value;
    localStorage.setItem("guard_checklist_state", JSON.stringify(appState));
}

function loadSavedState() {
    const saved = localStorage.getItem("guard_checklist_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error("Error al cargar estado previo:", e);
        }
    }
    
    // Asignar a inputs
    elGuardName.value = appState.guardName || "";
    elShiftType.value = appState.shiftType || "Fin de Semana - Diurno";
    elInspectionDate.value = appState.inspectionDate || new Date().toISOString().slice(0, 16);
    elBuildingName.value = appState.buildingName || "Sede Principal - Edificio Operativo";
    
    // Asegurar sentido ascendente por defecto
    appState.direction = "up";
}

// Configurar Escuchadores de Eventos
function setupEventListeners() {
    // Inputs de cabecera
    elGuardName.addEventListener("input", saveState);
    elShiftType.addEventListener("change", saveState);
    elInspectionDate.addEventListener("change", saveState);
    elBuildingName.addEventListener("input", saveState);

    // Filtro por categoría
    elCategoryFilter.addEventListener("change", (e) => {
        appState.categoryFilter = e.target.value;
        renderFloors();
    });

    // Botón de Reinicio
    document.getElementById("btn-reset").addEventListener("click", () => {
        if (confirm("¿Está seguro de reiniciar el checklist? Se borrarán las respuestas actuales.")) {
            appState.responses = {};
            appState.currentRecordId = null;
            saveState();
            renderAll();
        }
    });

    // Modal Handlers
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal-cancel").addEventListener("click", closeModal);
    document.getElementById("modal-save").addEventListener("click", saveModalObservation);

    // ========== IMAGE UPLOAD ==========
    if (elModalImage) {
        elModalImage.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert("Por favor seleccione un archivo de imagen válido.");
                elModalImage.value = "";
                return;
            }
            // Limit to 5 MB
            if (file.size > 5 * 1024 * 1024) {
                alert("La imagen es demasiado grande. El límite es 5 MB.");
                elModalImage.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = function(ev) {
                tempAttachedImageBase64 = ev.target.result;
                if (elFileUploadName) elFileUploadName.textContent = file.name;
                if (elImagePreview) elImagePreview.src = tempAttachedImageBase64;
                if (elImagePreviewContainer) elImagePreviewContainer.classList.remove("hidden");
            };
            reader.readAsDataURL(file);
        });
    }

    if (elBtnRemoveImage) {
        elBtnRemoveImage.addEventListener("click", () => {
            tempAttachedImageBase64 = null;
            if (elModalImage) elModalImage.value = "";
            if (elFileUploadName) elFileUploadName.textContent = "Ninguna imagen seleccionada";
            if (elImagePreview) elImagePreview.src = "";
            if (elImagePreviewContainer) elImagePreviewContainer.classList.add("hidden");
        });
    }

    // ========== HISTORY DRAWER ==========
    if (elBtnHistory) {
        elBtnHistory.addEventListener("click", () => {
            openHistoryDrawer();
        });
    }

    if (elBtnCloseHistory) {
        elBtnCloseHistory.addEventListener("click", closeHistoryDrawer);
    }

    if (elHistoryBackdrop) {
        elHistoryBackdrop.addEventListener("click", closeHistoryDrawer);
    }

    if (elHistoryDateFilter) {
        elHistoryDateFilter.addEventListener("change", () => {
            renderHistoryList();
        });
    }

    if (elBtnClearDateFilter) {
        elBtnClearDateFilter.addEventListener("click", () => {
            if (elHistoryDateFilter) elHistoryDateFilter.value = "";
            renderHistoryList();
        });
    }

    // ========== SAVE SHIFT ==========
    if (elBtnSaveShift) {
        elBtnSaveShift.addEventListener("click", saveCurrentShift);
    }

    // ========== IMAGE VIEWER MODAL ==========
    if (elBtnCloseViewer) {
        elBtnCloseViewer.addEventListener("click", () => {
            if (elModalImageViewer) elModalImageViewer.classList.add("hidden");
        });
    }

    // Close image viewer when clicking on backdrop
    if (elModalImageViewer) {
        elModalImageViewer.addEventListener("click", (e) => {
            if (e.target === elModalImageViewer) {
                elModalImageViewer.classList.add("hidden");
            }
        });
    }
}

// ========== HISTORY DRAWER FUNCTIONS ==========
function openHistoryDrawer() {
    if (elHistoryBackdrop) elHistoryBackdrop.classList.add("open");
    if (elHistoryDrawer) elHistoryDrawer.classList.add("open");
    renderHistoryList();
}

function closeHistoryDrawer() {
    if (elHistoryBackdrop) elHistoryBackdrop.classList.remove("open");
    if (elHistoryDrawer) elHistoryDrawer.classList.remove("open");
}

async function renderHistoryList() {
    if (!elHistoryListContainer) return;
    elHistoryListContainer.innerHTML = '<p class="no-history-msg"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</p>';

    try {
        await initDB();
        let records = await getAllGuardRecords();

        // Sort by date, most recent first
        records.sort((a, b) => {
            const da = new Date(a.inspectionDate || 0);
            const db = new Date(b.inspectionDate || 0);
            return db - da;
        });

        // Apply date filter
        const filterDate = elHistoryDateFilter ? elHistoryDateFilter.value : "";
        if (filterDate) {
            records = records.filter(r => {
                if (!r.inspectionDate) return false;
                const recordDate = r.inspectionDate.substring(0, 10);
                return recordDate === filterDate;
            });
        }

        if (records.length === 0) {
            elHistoryListContainer.innerHTML = `
                <div class="no-history-msg">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    ${filterDate ? "No hay registros para la fecha seleccionada." : "No hay guardias guardadas aún."}
                </div>
            `;
            return;
        }

        elHistoryListContainer.innerHTML = "";

        records.forEach(record => {
            const card = document.createElement("div");
            card.className = "history-item-card";

            // Calculate progress for this record
            let total = 0, answered = 0;
            DEFAULT_FLOORS_DATA.forEach(floor => {
                floor.items.forEach(item => {
                    total++;
                    const resp = record.responses ? record.responses[item.id] : null;
                    if (resp && resp.status) answered++;
                });
            });
            const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

            const dateDisplay = record.inspectionDate
                ? new Date(record.inspectionDate).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })
                : "Sin fecha";

            card.innerHTML = `
                <div class="history-card-header">
                    <div class="history-card-title">${escapeHtml(record.guardName || "Sin nombre")}</div>
                </div>
                <div class="history-card-meta">
                    <span><i class="fa-solid fa-calendar-day"></i> ${dateDisplay}</span>
                    <span><i class="fa-solid fa-business-time"></i> ${escapeHtml(record.shiftType || "N/D")}</span>
                </div>
                <div class="history-card-progress">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Progreso: ${pct}% (${answered}/${total})</span>
                    <div class="mini-progress-bar-container">
                        <div class="mini-progress-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>
                <div class="history-card-footer">
                    <button class="btn btn-sm btn-primary btn-load-record" data-id="${record.id}">
                        <i class="fa-solid fa-upload"></i> Cargar
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete-record" data-id="${record.id}">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            `;

            // Load button
            card.querySelector(".btn-load-record").addEventListener("click", () => {
                loadHistoryRecord(record.id);
            });

            // Delete button
            card.querySelector(".btn-delete-record").addEventListener("click", () => {
                deleteHistoryRecord(record.id);
            });

            elHistoryListContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading history:", err);
        elHistoryListContainer.innerHTML = '<p class="no-history-msg">Error al cargar el historial.</p>';
    }
}

// ========== SAVE CURRENT SHIFT ==========
async function saveCurrentShift() {
    // Sync current input values to appState before saving
    saveState();

    const guardName = appState.guardName;
    if (!guardName) {
        alert("Por favor ingrese el nombre del Inspector / Guardia antes de guardar.");
        elGuardName.focus();
        return;
    }

    const recordId = appState.currentRecordId || `shift-${Date.now()}`;

    const record = {
        id: recordId,
        guardName: appState.guardName,
        shiftType: appState.shiftType,
        inspectionDate: appState.inspectionDate,
        buildingName: appState.buildingName,
        responses: JSON.parse(JSON.stringify(appState.responses)), // Deep clone
        savedAt: new Date().toISOString()
    };

    try {
        await initDB();
        await saveGuardRecord(record);
        appState.currentRecordId = recordId;
        saveState();

        // Visual feedback
        const btn = elBtnSaveShift;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Guardado!';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 2000);
    } catch (err) {
        console.error("Error saving shift:", err);
        alert("Error al guardar la guardia. Intente nuevamente.");
    }
}

// ========== LOAD HISTORY RECORD ==========
async function loadHistoryRecord(id) {
    try {
        await initDB();
        const record = await getGuardRecord(id);
        if (!record) {
            alert("No se encontró el registro.");
            return;
        }

        if (!confirm("¿Desea cargar esta guardia? Se reemplazarán los datos actuales.")) {
            return;
        }

        // Replace appState with record data
        appState.guardName = record.guardName || "";
        appState.shiftType = record.shiftType || "Fin de Semana - Diurno";
        appState.inspectionDate = record.inspectionDate || new Date().toISOString().slice(0, 16);
        appState.buildingName = record.buildingName || "Sede Principal - Edificio Operativo";
        appState.responses = record.responses || {};
        appState.currentRecordId = record.id;

        // Update UI inputs
        elGuardName.value = appState.guardName;
        elShiftType.value = appState.shiftType;
        elInspectionDate.value = appState.inspectionDate;
        elBuildingName.value = appState.buildingName;

        saveState();
        renderAll();
        closeHistoryDrawer();
    } catch (err) {
        console.error("Error loading record:", err);
        alert("Error al cargar el registro.");
    }
}

// ========== DELETE HISTORY RECORD ==========
async function deleteHistoryRecord(id) {
    if (!confirm("¿Está seguro de eliminar este registro del historial?")) return;

    try {
        await initDB();
        await deleteGuardRecord(id);

        // If the deleted record is the currently loaded one, clear the reference
        if (appState.currentRecordId === id) {
            appState.currentRecordId = null;
            saveState();
        }

        renderHistoryList();
    } catch (err) {
        console.error("Error deleting record:", err);
        alert("Error al eliminar el registro.");
    }
}

// ========== IMAGE VIEWER ==========
function openImageViewer(base64Src, title) {
    if (!elModalImageViewer || !elViewerImg) return;
    elViewerImg.src = base64Src;
    if (elViewerTitle) elViewerTitle.textContent = title || "Evidencia";
    elModalImageViewer.classList.remove("hidden");
}

// Función de Renderizado Principal
function renderAll() {
    renderFloors();
    calculateMetrics();
}

// Renderizar Pisos según Dirección Elegida
function renderFloors() {
    elFloorsContainer.innerHTML = "";

    // Clonar y ordenar pisos de manera ascendente (Sótano a Terraza)
    let sortedFloors = [...DEFAULT_FLOORS_DATA];
    sortedFloors.sort((a, b) => a.order - b.order);

    const currentFilter = appState.categoryFilter;

    sortedFloors.forEach(floor => {
        // Filtrar tareas del piso si aplica
        const visibleItems = floor.items.filter(item => {
            if (currentFilter === "all") return true;
            return item.category === currentFilter;
        });

        if (visibleItems.length === 0) return; // Ocultar piso si no hay ítems del filtro

        const floorCard = document.createElement("div");
        floorCard.className = "floor-card";
        floorCard.id = `card-${floor.id}`;

        // Header del Piso
        const floorHeader = document.createElement("div");
        floorHeader.className = "floor-header";
        floorHeader.innerHTML = `
            <div class="floor-title-group">
                <span class="floor-badge">${floor.badge}</span>
                <span class="floor-name">${floor.name}</span>
            </div>
            <div class="floor-stats">
                <span id="stats-${floor.id}">${getFloorProgressText(floor)}</span>
                <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
        `;

        floorHeader.addEventListener("click", () => {
            floorCard.classList.toggle("collapsed");
        });

        // Cuerpo del Piso (Tareas)
        const floorBody = document.createElement("div");
        floorBody.className = "floor-body";

        const tasksList = document.createElement("div");
        tasksList.className = "task-items-list";

        visibleItems.forEach(item => {
            const response = appState.responses[item.id] || { status: null, severity: "", notes: "", image: null };
            const taskEl = document.createElement("div");
            taskEl.className = "task-item";
            taskEl.id = `item-${item.id}`;

            const isOk = response.status === "ok" ? "active" : "";
            const isIssue = response.status === "issue" ? "active" : "";
            const isNa = response.status === "na" ? "active" : "";

            let observationHtml = "";
            if (response.status === "issue" && response.notes) {
                // Build image thumbnail if image exists
                let imageThumbnailHtml = "";
                if (response.image) {
                    imageThumbnailHtml = `
                        <div class="task-image-preview-container">
                            <img class="task-image-preview" src="${response.image}" alt="Evidencia" data-item-id="${item.id}">
                        </div>
                    `;
                }

                observationHtml = `
                    <div class="observation-box">
                        <div class="obs-content-wrapper">
                            ${imageThumbnailHtml}
                            <div class="obs-content">
                                <strong><i class="fa-solid fa-triangle-exclamation"></i> Novedad (${response.severity || 'Media'}):</strong>
                                <p>${escapeHtml(response.notes)}</p>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="openObservationModal('${item.id}', '${escapeHtml(item.title)}')">
                            <i class="fa-solid fa-pen"></i> Editar
                        </button>
                    </div>
                `;
            }

            taskEl.innerHTML = `
                <div class="task-main">
                    <div class="task-info">
                        <div class="task-category"><i class="fa-solid fa-tag"></i> ${item.category}</div>
                        <div class="task-title">${item.title}</div>
                        <div class="task-desc">${item.desc}</div>
                    </div>
                    <div class="task-controls">
                        <button class="btn-status ${isOk}" data-status="ok" onclick="setStatus('${item.id}', 'ok')">
                            <i class="fa-solid fa-check"></i> Conforme
                        </button>
                        <button class="btn-status ${isIssue}" data-status="issue" onclick="handleIssueClick('${item.id}', '${escapeHtml(item.title)}')">
                            <i class="fa-solid fa-triangle-exclamation"></i> Novedad
                        </button>
                        <button class="btn-status ${isNa}" data-status="na" onclick="setStatus('${item.id}', 'na')">
                            <i class="fa-solid fa-minus"></i> N/A
                        </button>
                    </div>
                </div>
                ${observationHtml}
            `;

            // Add click listeners for image thumbnails after inserting into DOM
            tasksList.appendChild(taskEl);

            // Attach image viewer click event
            const imgThumb = taskEl.querySelector(".task-image-preview");
            if (imgThumb) {
                imgThumb.addEventListener("click", () => {
                    openImageViewer(response.image, item.title);
                });
            }
        });

        floorBody.appendChild(tasksList);
        floorCard.appendChild(floorHeader);
        floorCard.appendChild(floorBody);
        elFloorsContainer.appendChild(floorCard);
    });
}

function getFloorProgressText(floor) {
    const total = floor.items.length;
    let done = 0;
    floor.items.forEach(item => {
        if (appState.responses[item.id] && appState.responses[item.id].status) {
            done++;
        }
    });
    return `${done} / ${total} Verificados`;
}

// Manejo de Estados de Ítems
function setStatus(itemId, status) {
    if (!appState.responses[itemId]) {
        appState.responses[itemId] = { status: null, severity: "", notes: "", image: null };
    }

    if (appState.responses[itemId].status === status) {
        // Toggle deselection
        appState.responses[itemId].status = null;
    } else {
        appState.responses[itemId].status = status;
    }

    saveState();
    renderAll();
}

function handleIssueClick(itemId, title) {
    setStatus(itemId, 'issue');
    openObservationModal(itemId, title);
}

// Modal de Novedades
function openObservationModal(itemId, title) {
    elModalItemId.value = itemId;
    elModalTitle.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Novedad: ${title}`;
    
    const resp = appState.responses[itemId] || {};
    elModalSeverity.value = resp.severity || "Media";
    elModalNotes.value = resp.notes || "";

    // Restore image state for this item
    tempAttachedImageBase64 = resp.image || null;
    if (tempAttachedImageBase64) {
        if (elImagePreview) elImagePreview.src = tempAttachedImageBase64;
        if (elImagePreviewContainer) elImagePreviewContainer.classList.remove("hidden");
        if (elFileUploadName) elFileUploadName.textContent = "Imagen adjunta";
    } else {
        if (elImagePreview) elImagePreview.src = "";
        if (elImagePreviewContainer) elImagePreviewContainer.classList.add("hidden");
        if (elFileUploadName) elFileUploadName.textContent = "Ninguna imagen seleccionada";
    }
    if (elModalImage) elModalImage.value = "";
    
    elModal.classList.remove("hidden");
    elModalNotes.focus();
}

function closeModal() {
    elModal.classList.add("hidden");
    tempAttachedImageBase64 = null;
    if (elModalImage) elModalImage.value = "";
    if (elFileUploadName) elFileUploadName.textContent = "Ninguna imagen seleccionada";
    if (elImagePreview) elImagePreview.src = "";
    if (elImagePreviewContainer) elImagePreviewContainer.classList.add("hidden");
}

function saveModalObservation() {
    const itemId = elModalItemId.value;
    if (itemId && appState.responses[itemId]) {
        appState.responses[itemId].severity = elModalSeverity.value;
        appState.responses[itemId].notes = elModalNotes.value;
        appState.responses[itemId].image = tempAttachedImageBase64 || null;
        saveState();
        renderAll();
    }
    tempAttachedImageBase64 = null;
    closeModal();
}

// Cálculo de Métricas Globales
function calculateMetrics() {
    let totalItems = 0;
    let okCount = 0;
    let issueCount = 0;
    let naCount = 0;

    DEFAULT_FLOORS_DATA.forEach(floor => {
        floor.items.forEach(item => {
            totalItems++;
            const resp = appState.responses[item.id];
            if (resp) {
                if (resp.status === "ok") okCount++;
                if (resp.status === "issue") issueCount++;
                if (resp.status === "na") naCount++;
            }
        });
    });

    const answered = okCount + issueCount + naCount;
    const progressPct = totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0;

    elValProgress.textContent = `${progressPct}%`;
    elBarProgress.style.width = `${progressPct}%`;
    elValOk.textContent = okCount;
    elValIssue.textContent = issueCount;
    elValNa.textContent = naCount;
}



function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
