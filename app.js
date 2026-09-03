/**
 * Checklist de Inspección de Guardia - Operaciones & Servicios
 * Manejo de estado, departamentos, asistencias, recorridos (10 AM / 2 PM / 7 PM / Adicional), firmas, fotos y cámara en vivo.
 */

// Estructura predefinida de Departamentos y Puntos de Control
const DEFAULT_SECTIONS_DATA = [
    {
        id: "sec-asistencias",
        name: "1. Asistencias de Personal (Interno & Contratistas)",
        badge: "Asistencias",
        order: 1,
        items: [
            { id: "asist-seguridad", category: "Asistencias", type: "asistencia_counter", issueOnly: true, title: "Personal Interno - Seguridad", desc: "Verificar cantidad de personas presentes y registrar novedades si existen." },
            { id: "asist-operaciones", category: "Asistencias", type: "asistencia_counter", issueOnly: true, title: "Personal Interno - Operaciones", desc: "Verificar cantidad de personas presentes del equipo técnico de operaciones." },
            { id: "asist-parking", category: "Asistencias", type: "asistencia_counter", issueOnly: true, title: "Personal Interno - Parking", desc: "Verificar cantidad de operadores de estacionamiento y taquillas presentes." },
            { id: "asist-jdml", category: "Asistencias", type: "asistencia_counter", issueOnly: true, title: "Contratistas / Aliados - JDML", desc: "Verificar cantidad de personas del personal de la contratista JDML." },
            { id: "asist-dl", category: "Asistencias", type: "asistencia_counter", issueOnly: true, title: "Contratistas / Aliados - DL", desc: "Verificar cantidad de personas del personal de la contratista DL." },
            { id: "asist-ferremantenimiento", category: "Asistencias", type: "asistencia_counter", issueOnly: true, title: "Contratistas / Aliados - FERREMANTENIMIENTO", desc: "Verificar cantidad de personas en trabajos de Ferremantenimiento." },
            { id: "asist-aliados-comerciales", category: "Asistencias", type: "asistencia_counter", counterLabel: "Cantidad de Locales", issueOnly: true, title: "Aliados Comerciales (Asistencia & Horario)", desc: "Verificar cantidad de aliados comerciales y cumplimiento de horario." }
        ]
    },
    {
        id: "sec-operaciones",
        name: "2. Operaciones & Equipos Centrales",
        badge: "Operaciones",
        order: 2,
        items: [
            { id: "op-voltaje", category: "Operaciones", type: "value_input", issueOnly: true, inputType: "text", unit: "Voltios (V)", placeholder: "Ej. 208V / 220V", title: "Voltaje (Valor Promedio)", desc: "Ingresar lectura del valor promedio de voltaje principal registrado." },
            { id: "op-hidroneumatico", category: "Operaciones", type: "status_buttons", okLabel: "Operativo", issueLabel: "No Operativo", title: "Sistema Hidroneumático", desc: "Verificar bombas de agua, presión de trabajo (PSI) y tableros de control." },
            { id: "op-banos", category: "Operaciones", type: "status_notes", title: "Estado General de Baños", desc: "Revisar baños de visitantes en todos los niveles, ausencia de fugas y limpieza." },
            { id: "op-chiller-1", category: "Operaciones", type: "dual_value", issueOnly: true, title: "Chiller 1 (Suministro & Retorno)", label1: "Suministro (°C / PSI)", label2: "Retorno (°C / PSI)", desc: "Registrar lecturas de temperatura/presión de Suministro y Retorno del Chiller 1." },
            { id: "op-chiller-3", category: "Operaciones", type: "dual_value", issueOnly: true, title: "Chiller 3 (Suministro & Retorno)", label1: "Suministro (°C / PSI)", label2: "Retorno (°C / PSI)", desc: "Registrar lecturas de temperatura/presión de Suministro y Retorno del Chiller 3." },
            { id: "op-vrf", category: "Operaciones", type: "status_counter", issueOnly: true, max: 10, title: "Sistema VRF (Climatización)", counterLabel: "Equipos Disponibles (de 10 totales)", desc: "Verificar número de equipos VRF disponibles de 10 totales." },
            { id: "op-escaleras", category: "Operaciones", type: "value_input", issueOnly: true, inputType: "number", placeholder: "Ej. 4", title: "Escaleras Mecánicas Operativas", desc: "Indicar cantidad de escaleras mecánicas en servicio activo." },
            { id: "op-ascensores-carga", category: "Operaciones", type: "value_input", issueOnly: true, inputType: "text", placeholder: "Ej. 2 de 2 operativos", title: "Ascensores de Carga (2 Totales)", desc: "Verificar si están funcionales los 2 ascensores de carga o registrar novedades." },
            { id: "op-ascensores-panorami", category: "Operaciones", type: "value_input", issueOnly: true, inputType: "text", placeholder: "Ej. 6 de 6 operativos", title: "Ascensores Panorámicos (6 Totales del Mall)", desc: "Indicar operatividad de los 6 ascensores panorámicos principales." }
        ]
    },
    {
        id: "sec-parking",
        name: "3. Parking / Estacionamiento",
        badge: "Parking",
        order: 3,
        items: [
            { id: "park-barreras", category: "Parking", type: "status_notes", title: "Barreras de Acceso", desc: "Verificar operatividad de brazos y barreras de entrada y salida." },
            { id: "park-cajas", category: "Parking", type: "status_notes", title: "Cajas de Pago y Taquillas", desc: "Revisar funcionamiento de cajas automáticas/manuales de cobro." }
        ]
    },
    {
        id: "sec-it",
        name: "4. IT & Tecnología",
        badge: "IT",
        order: 4,
        items: [
            { id: "it-wifi", category: "IT", type: "status_notes", title: "Red Wifi", desc: "Verificar señal y conectividad de la red Wifi comercial y administrativa." },
            { id: "it-hilo-musical", category: "IT", type: "status_notes", title: "Hilo Musical General", desc: "Comprobar audio y reproducción en pasillos y zonas comunes." },
            { id: "it-pantallas", category: "IT", type: "status_notes", title: "Pantallas Publicitarias y Tótems", desc: "Revisar transmisión de contenidos digitales y estado de pantallas." },
            { id: "it-hilo-foodhall", category: "IT", type: "status_notes", title: "Hilo Musical Food Hall", desc: "Verificar sistema de audio independiente del área del Food Hall." }
        ]
    },
    {
        id: "sec-seguridad",
        name: "5. Seguridad & CCTV",
        badge: "Seguridad",
        order: 5,
        items: [
            { id: "seg-cctv", category: "Seguridad", type: "status_buttons", okLabel: "Activo", issueLabel: "No Activo", title: "Circuito Cerrado (CCTV)", desc: "Verificar grabadores NVR/DVR y monitores activos en centro de control." },
            { id: "seg-camaras", category: "Seguridad", type: "status_notes", title: "Cámaras de Vigilancia", desc: "Revisar operatividad, cobertura y visión de las cámaras internas y externas." }
        ]
    },
    {
        id: "sec-trafico",
        name: "6. Tráfico de Visitantes (Registro 7:00 PM)",
        badge: "Tráfico",
        order: 6,
        items: [
            { id: "trafico-personas", category: "Tráfico", type: "value_input", issueOnly: true, inputType: "number", placeholder: "Ej. 3500", title: "Conteo de Personas (7:00 PM)", desc: "Afluencia estimada de personas a las 7:00 PM (Viernes, Sábado y Domingo)." },
            { id: "trafico-carros", category: "Tráfico", type: "value_input", issueOnly: true, inputType: "number", placeholder: "Ej. 1200", title: "Conteo de Carros / Vehículos (7:00 PM)", desc: "Afluencia estimada de vehículos ingresados a las 7:00 PM." }
        ]
    },
    {
        id: "sec-eventos",
        name: "7. Eventos del Día",
        badge: "Eventos",
        order: 7,
        items: [
            { id: "evento-nombre", category: "Eventos", type: "value_input", issueOnly: true, inputType: "text", placeholder: "Ej. Concierto / Actividad Especial / N/A", title: "Nombre del Evento", desc: "Indicar nombre de la actividad o evento en desarrollo." },
            { id: "evento-lugar", category: "Eventos", type: "value_input", issueOnly: true, inputType: "text", placeholder: "Ej. Plaza Central - Nivel 2", title: "Lugar / Ubicación del Evento", desc: "Indicar ubicación exacta dentro de las instalaciones." }
        ]
    },
    {
        id: "sec-novedades",
        name: "8. Reporte Escrito de Novedades",
        badge: "Novedades",
        order: 8,
        items: [
            { id: "nov-reporte", category: "Novedades", type: "text_notes_photo", title: "Descripción Detallada de Novedades", desc: "Redacte las observaciones o incidencias relevantes del recorrido. Puede tomar foto directamente o adjuntar archivo." }
        ]
    },
    {
        id: "sec-fotos",
        name: "9. Fotos Generales del Recorrido",
        badge: "Fotos",
        order: 9,
        items: [
            { id: "fotos-generales", category: "Fotos", type: "general_photos_gallery", title: "Galería Fotográfica de la Inspección", desc: "Tome fotografías generales del recorrido directamente desde el dispositivo o suba imágenes." }
        ]
    }
];

// Estado global de la aplicación
let appState = {
    currentRecordId: null,
    guardName: "",
    shiftTimeSlot: "10:00 AM",
    inspectionDate: new Date().toISOString().slice(0, 16),
    buildingName: "Sede Principal - Edificio Operativo",
    lightingStatus: "Cumplió",
    commercialHoursStatus: "Cumplieron",
    categoryFilter: "all",
    responses: {},
    generalPhotos: []
};

// Referencias del DOM
const elGuardName = document.getElementById("guard-name");
const elShiftTimeSlot = document.getElementById("shift-time-slot");
const elInspectionDate = document.getElementById("inspection-date");
const elBuildingName = document.getElementById("building-name");
const elLightingStatus = document.getElementById("lighting-status");
const elCommercialHoursStatus = document.getElementById("commercial-hours-status");
const elBtnExtraRound = document.getElementById("btn-extra-round");
const elCurrentRoundBadge = document.getElementById("current-round-badge");
const elCategoryFilter = document.getElementById("category-filter");
const elFloorsContainer = document.getElementById("floors-container");

// Referencias para modal de observaciones de fotos por item
const elModalImage = document.getElementById("modal-image");
const elFileUploadName = document.getElementById("file-upload-name");
const elImagePreviewContainer = document.getElementById("modal-image-preview-container");
const elImagePreview = document.getElementById("modal-image-preview");
const elBtnRemoveImage = document.getElementById("btn-remove-image");
const elBtnOpenCameraModal = document.getElementById("btn-open-camera-modal");

// Referencias para Cámara en Vivo
const elModalCamera = document.getElementById("modal-camera");
const elCameraStream = document.getElementById("camera-stream");
const elCameraCanvas = document.getElementById("camera-canvas");
const elCameraSnapshotPreview = document.getElementById("camera-snapshot-preview");
const elBtnCloseCamera = document.getElementById("btn-close-camera");
const elBtnSwitchCamera = document.getElementById("btn-switch-camera");
const elBtnCapturePhoto = document.getElementById("btn-capture-photo");
const elBtnRetakePhoto = document.getElementById("btn-retake-photo");
const elBtnUsePhoto = document.getElementById("btn-use-photo");

// Control de flujo de cámara en vivo
let activeMediaStream = null;
let currentFacingMode = "environment";
let capturedPhotoBase64 = null;
let cameraTargetType = "modal_observation";

// Referencias para Historial
const elBtnHistory = document.getElementById("btn-history");
const elBtnSaveShift = document.getElementById("btn-save-shift");
const elHistoryBackdrop = document.getElementById("history-backdrop");
const elHistoryDrawer = document.getElementById("history-drawer");
const elBtnCloseHistory = document.getElementById("btn-close-history");
const elHistoryDateFilter = document.getElementById("history-date-filter");
const elBtnClearDateFilter = document.getElementById("btn-clear-date-filter");
const elHistoryListContainer = document.getElementById("history-list-container");

// Referencias para Visor de Imagen Ampliada
const elModalImageViewer = document.getElementById("modal-image-viewer");
const elViewerTitle = document.getElementById("viewer-title");
const elViewerImg = document.getElementById("viewer-img");
const elBtnCloseViewer = document.getElementById("btn-close-viewer");

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

document.addEventListener("DOMContentLoaded", () => {
    loadSavedState();
    setupEventListeners();
    renderAll();
});

function saveState() {
    appState.guardName = elGuardName ? elGuardName.value : "";
    appState.shiftTimeSlot = elShiftTimeSlot ? elShiftTimeSlot.value : "10:00 AM";
    appState.inspectionDate = elInspectionDate ? elInspectionDate.value : "";
    appState.buildingName = elBuildingName ? elBuildingName.value : "";
    appState.lightingStatus = elLightingStatus ? elLightingStatus.value : "Cumplió";
    appState.commercialHoursStatus = elCommercialHoursStatus ? elCommercialHoursStatus.value : "Cumplieron";
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
    
    if (elGuardName) elGuardName.value = appState.guardName || "";
    if (elShiftTimeSlot) elShiftTimeSlot.value = appState.shiftTimeSlot || "10:00 AM";
    if (elInspectionDate) elInspectionDate.value = appState.inspectionDate || new Date().toISOString().slice(0, 16);
    if (elBuildingName) elBuildingName.value = appState.buildingName || "Sede Principal - Edificio Operativo";
    if (elLightingStatus) elLightingStatus.value = appState.lightingStatus || "Cumplió";
    if (elCommercialHoursStatus) elCommercialHoursStatus.value = appState.commercialHoursStatus || "Cumplieron";
    
    updateRoundBadge();
}

function updateRoundBadge() {
    if (!elCurrentRoundBadge) return;
    const timeVal = appState.shiftTimeSlot;
    if (timeVal === "10:00 AM") {
        elCurrentRoundBadge.innerHTML = `<i class="fa-solid fa-sun"></i> 10:00 AM - Recorrido Mañana`;
        elCurrentRoundBadge.className = "badge badge-info";
    } else if (timeVal === "2:00 PM") {
        elCurrentRoundBadge.innerHTML = `<i class="fa-solid fa-cloud-sun"></i> 2:00 PM - Recorrido Tarde`;
        elCurrentRoundBadge.className = "badge badge-warning";
    } else if (timeVal === "7:00 PM") {
        elCurrentRoundBadge.innerHTML = `<i class="fa-solid fa-moon"></i> 7:00 PM - Recorrido Noche`;
        elCurrentRoundBadge.className = "badge badge-info";
    } else {
        elCurrentRoundBadge.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Recorrido Adicional`;
        elCurrentRoundBadge.className = "badge badge-success";
    }
}

function setupEventListeners() {
    if (elGuardName) elGuardName.addEventListener("input", saveState);
    if (elShiftTimeSlot) elShiftTimeSlot.addEventListener("change", (e) => {
        appState.shiftTimeSlot = e.target.value;
        updateRoundBadge();
        saveState();
    });
    if (elInspectionDate) elInspectionDate.addEventListener("change", saveState);
    if (elBuildingName) elBuildingName.addEventListener("input", saveState);
    if (elLightingStatus) elLightingStatus.addEventListener("change", saveState);
    if (elCommercialHoursStatus) elCommercialHoursStatus.addEventListener("change", saveState);

    if (elBtnExtraRound) {
        elBtnExtraRound.addEventListener("click", () => {
            appState.shiftTimeSlot = "Recorrido Adicional";
            if (elShiftTimeSlot) elShiftTimeSlot.value = "Recorrido Adicional";
            updateRoundBadge();
            saveState();
        });
    }

    if (elCategoryFilter) {
        elCategoryFilter.addEventListener("change", (e) => {
            appState.categoryFilter = e.target.value;
            renderFloors();
        });
    }

    const btnReset = document.getElementById("btn-reset");
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            if (confirm("¿Está seguro de reiniciar el checklist? Se borrarán las respuestas del recorrido actual.")) {
                appState.responses = {};
                appState.generalPhotos = [];
                appState.currentRecordId = null;
                saveState();
                renderAll();
            }
        });
    }

    const modalClose = document.getElementById("modal-close");
    const modalCancel = document.getElementById("modal-cancel");
    const modalSave = document.getElementById("modal-save");
    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalCancel) modalCancel.addEventListener("click", closeModal);
    if (modalSave) modalSave.addEventListener("click", saveModalObservation);

    if (elModalImage) {
        elModalImage.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert("Por favor seleccione un archivo de imagen válido.");
                elModalImage.value = "";
                return;
            }
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

    if (elBtnOpenCameraModal) {
        elBtnOpenCameraModal.addEventListener("click", () => {
            openCameraModal("modal_observation");
        });
    }

    if (elBtnCloseCamera) elBtnCloseCamera.addEventListener("click", closeCameraModal);
    if (elBtnSwitchCamera) elBtnSwitchCamera.addEventListener("click", switchCamera);
    if (elBtnCapturePhoto) elBtnCapturePhoto.addEventListener("click", captureCameraSnapshot);
    if (elBtnRetakePhoto) elBtnRetakePhoto.addEventListener("click", resetCameraViewfinder);
    if (elBtnUsePhoto) elBtnUsePhoto.addEventListener("click", useCapturedPhoto);

    if (elBtnHistory) elBtnHistory.addEventListener("click", openHistoryDrawer);
    if (elBtnCloseHistory) elBtnCloseHistory.addEventListener("click", closeHistoryDrawer);
    if (elHistoryBackdrop) elHistoryBackdrop.addEventListener("click", closeHistoryDrawer);

    if (elHistoryDateFilter) {
        elHistoryDateFilter.addEventListener("change", renderHistoryList);
    }

    if (elBtnClearDateFilter) {
        elBtnClearDateFilter.addEventListener("click", () => {
            if (elHistoryDateFilter) elHistoryDateFilter.value = "";
            renderHistoryList();
        });
    }

    if (elBtnSaveShift) elBtnSaveShift.addEventListener("click", saveCurrentShift);

    if (elBtnCloseViewer) {
        elBtnCloseViewer.addEventListener("click", () => {
            if (elModalImageViewer) elModalImageViewer.classList.add("hidden");
        });
    }

    if (elModalImageViewer) {
        elModalImageViewer.addEventListener("click", (e) => {
            if (e.target === elModalImageViewer) {
                elModalImageViewer.classList.add("hidden");
            }
        });
    }
}

// ========== CÁMARA EN VIVO WEBRTC ==========
async function openCameraModal(targetType = "modal_observation") {
    cameraTargetType = targetType;
    capturedPhotoBase64 = null;
    
    if (elModalCamera) elModalCamera.classList.remove("hidden");
    resetCameraViewfinder();
    
    try {
        await startCameraStream(currentFacingMode);
    } catch (err) {
        console.error("Error al iniciar cámara:", err);
        alert("No se pudo acceder a la cámara del dispositivo. Usando selector directo de archivo.");
        closeCameraModal();
        if (targetType === "modal_observation" && elModalImage) {
            elModalImage.click();
        } else if (targetType === "general_photos") {
            const input = document.getElementById("general-photos-input");
            if (input) input.click();
        }
    }
}

async function startCameraStream(facingMode = "environment") {
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("API MediaDevices no soportada en este navegador.");
    }

    const constraints = {
        video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };

    activeMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (elCameraStream) {
        elCameraStream.srcObject = activeMediaStream;
        await elCameraStream.play();
    }
}

function stopCameraStream() {
    if (activeMediaStream) {
        activeMediaStream.getTracks().forEach(track => track.stop());
        activeMediaStream = null;
    }
    if (elCameraStream) {
        elCameraStream.srcObject = null;
    }
}

function closeCameraModal() {
    stopCameraStream();
    if (elModalCamera) elModalCamera.classList.add("hidden");
}

async function switchCamera() {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    try {
        await startCameraStream(currentFacingMode);
    } catch (err) {
        console.error("Error al cambiar cámara:", err);
    }
}

function captureCameraSnapshot() {
    if (!elCameraStream || !elCameraCanvas) return;
    
    const video = elCameraStream;
    const canvas = elCameraCanvas;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedPhotoBase64 = canvas.toDataURL("image/jpeg", 0.85);

    if (elCameraSnapshotPreview) {
        elCameraSnapshotPreview.src = capturedPhotoBase64;
        elCameraSnapshotPreview.classList.remove("hidden");
    }
    if (elCameraStream) elCameraStream.classList.add("hidden");

    if (elBtnCapturePhoto) elBtnCapturePhoto.classList.add("hidden");
    if (elBtnSwitchCamera) elBtnSwitchCamera.classList.add("hidden");
    if (elBtnRetakePhoto) elBtnRetakePhoto.classList.remove("hidden");
    if (elBtnUsePhoto) elBtnUsePhoto.classList.remove("hidden");
}

function resetCameraViewfinder() {
    capturedPhotoBase64 = null;
    if (elCameraSnapshotPreview) {
        elCameraSnapshotPreview.src = "";
        elCameraSnapshotPreview.classList.add("hidden");
    }
    if (elCameraStream) elCameraStream.classList.remove("hidden");

    if (elBtnCapturePhoto) elBtnCapturePhoto.classList.remove("hidden");
    if (elBtnSwitchCamera) elBtnSwitchCamera.classList.remove("hidden");
    if (elBtnRetakePhoto) elBtnRetakePhoto.classList.add("hidden");
    if (elBtnUsePhoto) elBtnUsePhoto.classList.add("hidden");
}

function useCapturedPhoto() {
    if (!capturedPhotoBase64) return;

    if (cameraTargetType === "modal_observation") {
        tempAttachedImageBase64 = capturedPhotoBase64;
        if (elImagePreview) elImagePreview.src = tempAttachedImageBase64;
        if (elImagePreviewContainer) elImagePreviewContainer.classList.remove("hidden");
        if (elFileUploadName) elFileUploadName.textContent = "Foto tomada con cámara";
    } else if (cameraTargetType === "general_photos") {
        if (!appState.generalPhotos) appState.generalPhotos = [];
        appState.generalPhotos.push(capturedPhotoBase64);
        saveState();
        renderFloors();
    }

    closeCameraModal();
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

        records.sort((a, b) => {
            const da = new Date(a.inspectionDate || 0);
            const db = new Date(b.inspectionDate || 0);
            return db - da;
        });

        const filterDate = elHistoryDateFilter ? elHistoryDateFilter.value : "";
        if (filterDate) {
            records = records.filter(r => {
                if (!r.inspectionDate) return false;
                return r.inspectionDate.substring(0, 10) === filterDate;
            });
        }

        if (records.length === 0) {
            elHistoryListContainer.innerHTML = `
                <div class="no-history-msg">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    ${filterDate ? "No hay registros para la fecha seleccionada." : "No hay recorridos de guardia guardados aún."}
                </div>
            `;
            return;
        }

        elHistoryListContainer.innerHTML = "";

        records.forEach(record => {
            const card = document.createElement("div");
            card.className = "history-item-card";

            let total = 0, answered = 0;
            DEFAULT_SECTIONS_DATA.forEach(section => {
                section.items.forEach(item => {
                    total++;
                    const resp = record.responses ? record.responses[item.id] : null;
                    if (resp && (resp.status || resp.value || resp.notes || resp.count !== undefined || (resp.photos && resp.photos.length > 0))) answered++;
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
                    <span><i class="fa-solid fa-clock"></i> Recorrido: <strong>${escapeHtml(record.shiftTimeSlot || "N/D")}</strong></span>
                    <span><i class="fa-solid fa-lightbulb"></i> Iluminación: ${escapeHtml(record.lightingStatus || "N/D")}</span>
                </div>
                <div class="history-card-progress">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Completado: ${pct}%</span>
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

            card.querySelector(".btn-load-record").addEventListener("click", () => {
                loadHistoryRecord(record.id);
            });

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
    saveState();

    const guardName = appState.guardName;
    if (!guardName) {
        alert("Por favor ingrese el nombre del Inspector / Guardia antes de guardar.");
        if (elGuardName) elGuardName.focus();
        return;
    }

    const recordId = appState.currentRecordId || `shift-${Date.now()}`;

    const record = {
        id: recordId,
        guardName: appState.guardName,
        shiftTimeSlot: appState.shiftTimeSlot,
        inspectionDate: appState.inspectionDate,
        buildingName: appState.buildingName,
        lightingStatus: appState.lightingStatus,
        commercialHoursStatus: appState.commercialHoursStatus,
        responses: JSON.parse(JSON.stringify(appState.responses)),
        generalPhotos: [...appState.generalPhotos],
        savedAt: new Date().toISOString()
    };

    try {
        await initDB();
        await saveGuardRecord(record);
        appState.currentRecordId = recordId;
        saveState();

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

        if (!confirm("¿Desea cargar este recorrido de guardia? Se reemplazarán los datos en pantalla.")) {
            return;
        }

        appState.guardName = record.guardName || "";
        appState.shiftTimeSlot = record.shiftTimeSlot || "10:00 AM";
        appState.inspectionDate = record.inspectionDate || new Date().toISOString().slice(0, 16);
        appState.buildingName = record.buildingName || "Sede Principal - Edificio Operativo";
        appState.lightingStatus = record.lightingStatus || "Cumplió";
        appState.commercialHoursStatus = record.commercialHoursStatus || "Cumplieron";
        appState.responses = record.responses || {};
        appState.generalPhotos = record.generalPhotos || [];
        appState.currentRecordId = record.id;

        if (elGuardName) elGuardName.value = appState.guardName;
        if (elShiftTimeSlot) elShiftTimeSlot.value = appState.shiftTimeSlot;
        if (elInspectionDate) elInspectionDate.value = appState.inspectionDate;
        if (elBuildingName) elBuildingName.value = appState.buildingName;
        if (elLightingStatus) elLightingStatus.value = appState.lightingStatus;
        if (elCommercialHoursStatus) elCommercialHoursStatus.value = appState.commercialHoursStatus;

        updateRoundBadge();
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

function renderAll() {
    renderFloors();
    calculateMetrics();
}

// Renderizar Departamentos y Secciones de Inspección
function renderFloors() {
    if (!elFloorsContainer) return;
    elFloorsContainer.innerHTML = "";

    let sortedSections = [...DEFAULT_SECTIONS_DATA];
    sortedSections.sort((a, b) => a.order - b.order);

    const currentFilter = appState.categoryFilter;

    sortedSections.forEach(section => {
        const visibleItems = section.items.filter(item => {
            if (currentFilter === "all") return true;
            return item.category === currentFilter;
        });

        if (visibleItems.length === 0) return;

        const sectionCard = document.createElement("div");
        sectionCard.className = "floor-card";
        sectionCard.id = `card-${section.id}`;

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "floor-header";
        sectionHeader.innerHTML = `
            <div class="floor-title-group">
                <span class="floor-badge">${section.badge}</span>
                <span class="floor-name">${section.name}</span>
            </div>
            <div class="floor-stats">
                <span id="stats-${section.id}">${getSectionProgressText(section)}</span>
                <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </div>
        `;

        sectionHeader.addEventListener("click", () => {
            sectionCard.classList.toggle("collapsed");
        });

        const sectionBody = document.createElement("div");
        sectionBody.className = "floor-body";

        const tasksList = document.createElement("div");
        tasksList.className = "task-items-list";

        visibleItems.forEach(item => {
            const resp = appState.responses[item.id] || { status: null, value: "", val1: "", val2: "", count: 0, notes: "", image: null };
            const taskEl = document.createElement("div");
            taskEl.className = "task-item";
            taskEl.id = `item-${item.id}`;

            const okLabel = item.okLabel || "Conforme";
            const issueLabel = item.issueLabel || "Novedad";

            const isOk = resp.status === "ok" ? "active" : "";
            const isIssue = resp.status === "issue" ? "active" : "";
            const isNa = resp.status === "na" ? "active" : "";

            let customControlsHtml = "";

            if (item.type === "asistencia_counter") {
                const labelText = item.counterLabel || "Cantidad de Personas Presentes";
                const iconClass = item.counterLabel ? "fa-store" : "fa-users";
                customControlsHtml = `
                    <div class="task-custom-controls">
                        <div class="custom-input-group">
                            <label><i class="fa-solid ${iconClass}"></i> ${labelText}:</label>
                            <input type="number" 
                                   min="0" 
                                   class="task-inline-input" 
                                   style="width: 110px;" 
                                   placeholder="Ej. 5" 
                                   value="${resp.count !== undefined && resp.count !== null ? resp.count : ''}"
                                   onchange="updateItemCount('${item.id}', this.value)">
                        </div>
                    </div>
                `;
            } else if (item.type === "value_input") {
                customControlsHtml = `
                    <div class="task-custom-controls">
                        <div class="custom-input-group">
                            <label><i class="fa-solid fa-pen-to-square"></i> Registro de Valor:</label>
                            <input type="${item.inputType || 'text'}" 
                                   class="task-inline-input" 
                                   placeholder="${item.placeholder || ''}" 
                                   value="${escapeHtml(resp.value || '')}"
                                   onchange="updateItemValue('${item.id}', this.value)">
                        </div>
                    </div>
                `;
            } else if (item.type === "dual_value") {
                customControlsHtml = `
                    <div class="task-custom-controls">
                        <div class="dual-input-wrapper">
                            <div class="custom-input-group">
                                <label>${item.label1 || 'Suministro'}:</label>
                                <input type="text" 
                                       class="task-inline-input" 
                                       placeholder="Ej. 7 °C / 45 PSI" 
                                       value="${escapeHtml(resp.val1 || '')}"
                                       onchange="updateItemDualValue('${item.id}', 'val1', this.value)">
                            </div>
                            <div class="custom-input-group">
                                <label>${item.label2 || 'Retorno'}:</label>
                                <input type="text" 
                                       class="task-inline-input" 
                                       placeholder="Ej. 12 °C / 55 PSI" 
                                       value="${escapeHtml(resp.val2 || '')}"
                                       onchange="updateItemDualValue('${item.id}', 'val2', this.value)">
                            </div>
                        </div>
                    </div>
                `;
            } else if (item.type === "status_counter") {
                customControlsHtml = `
                    <div class="task-custom-controls">
                        <div class="custom-input-group">
                            <label><i class="fa-solid fa-server"></i> ${item.counterLabel || 'Equipos Disponibles'}:</label>
                            <input type="number" 
                                   min="0" 
                                   max="${item.max || 10}" 
                                   class="task-inline-input" 
                                   style="width: 90px;" 
                                   value="${resp.count !== undefined ? resp.count : (item.max || 10)}"
                                   onchange="updateItemCount('${item.id}', this.value)">
                        </div>
                    </div>
                `;
            } else if (item.type === "text_notes_photo") {
                customControlsHtml = `
                    <div class="text-notes-wrapper">
                        <textarea class="task-textarea" 
                                  placeholder="Escriba aquí los detalles de la novedad u observación..." 
                                  onchange="updateItemNotes('${item.id}', this.value)">${escapeHtml(resp.notes || '')}</textarea>
                    </div>
                `;
            } else if (item.type === "general_photos_gallery") {
                let photosHtml = "";
                if (appState.generalPhotos && appState.generalPhotos.length > 0) {
                    photosHtml = appState.generalPhotos.map((photoSrc, idx) => `
                        <div class="general-photo-card">
                            <img src="${photoSrc}" alt="Foto General ${idx+1}" onclick="openImageViewer('${photoSrc}', 'Foto General ${idx+1}')">
                            <button class="btn-delete-photo" onclick="deleteGeneralPhoto(${idx})" title="Eliminar foto"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    `).join("");
                }

                customControlsHtml = `
                    <div class="general-photos-wrapper">
                        <div class="image-upload-wrapper">
                            <input type="file" id="general-photos-input" accept="image/*" capture="environment" multiple style="display:none;" onchange="handleGeneralPhotosUpload(event)">
                            <button type="button" class="btn btn-primary btn-sm" onclick="openCameraModal('general_photos')">
                                <i class="fa-solid fa-camera"></i> Tomar Foto con Cámara
                            </button>
                            <label for="general-photos-input" class="btn btn-secondary btn-sm btn-file-upload">
                                <i class="fa-solid fa-upload"></i> Subir Imágenes
                            </label>
                            <span class="file-name-label">${appState.generalPhotos ? appState.generalPhotos.length : 0} fotos en galería</span>
                        </div>
                        <div class="general-photos-grid">
                            ${photosHtml}
                        </div>
                    </div>
                `;
            }

            let observationHtml = "";
            if (resp.status === "issue" && resp.notes && item.type !== "text_notes_photo") {
                let imageThumbnailHtml = "";
                if (resp.image) {
                    imageThumbnailHtml = `
                        <div class="task-image-preview-container">
                            <img class="task-image-preview" src="${resp.image}" alt="Evidencia" data-item-id="${item.id}">
                        </div>
                    `;
                }

                observationHtml = `
                    <div class="observation-box">
                        <div class="obs-content-wrapper">
                            ${imageThumbnailHtml}
                            <div class="obs-content">
                                <strong><i class="fa-solid fa-triangle-exclamation"></i> Novedad (${resp.severity || 'Media'}):</strong>
                                <p>${escapeHtml(resp.notes)}</p>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-secondary" onclick="openObservationModal('${item.id}', '${escapeHtml(item.title)}')">
                            <i class="fa-solid fa-pen"></i> Editar
                        </button>
                    </div>
                `;
            }

            // Status Control Buttons Rendering:
            // If item.issueOnly is true or is an Asistencia or Value Input or Dual Value or Status Counter, render ONLY Novedad button!
            let statusControlsHtml = "";
            const isOnlyIssueRequired = item.issueOnly || item.category === "Asistencias" || item.type === "asistencia_counter" || item.type === "value_input" || item.type === "dual_value" || item.type === "status_counter";

            if (item.type !== "general_photos_gallery" && item.type !== "text_notes_photo") {
                if (isOnlyIssueRequired) {
                    statusControlsHtml = `
                        <div class="task-controls">
                            <button class="btn-status ${isIssue}" data-status="issue" onclick="handleIssueClick('${item.id}', '${escapeHtml(item.title)}')">
                                <i class="fa-solid fa-triangle-exclamation"></i> ${issueLabel}
                            </button>
                        </div>
                    `;
                } else {
                    statusControlsHtml = `
                        <div class="task-controls">
                            <button class="btn-status ${isOk}" data-status="ok" onclick="setStatus('${item.id}', 'ok')">
                                <i class="fa-solid fa-check"></i> ${okLabel}
                            </button>
                            <button class="btn-status ${isIssue}" data-status="issue" onclick="handleIssueClick('${item.id}', '${escapeHtml(item.title)}')">
                                <i class="fa-solid fa-triangle-exclamation"></i> ${issueLabel}
                            </button>
                            <button class="btn-status ${isNa}" data-status="na" onclick="setStatus('${item.id}', 'na')">
                                <i class="fa-solid fa-minus"></i> N/A
                            </button>
                        </div>
                    `;
                }
            }

            taskEl.innerHTML = `
                <div class="task-main">
                    <div class="task-info">
                        <div class="task-category"><i class="fa-solid fa-tag"></i> ${item.category}</div>
                        <div class="task-title">${item.title}</div>
                        <div class="task-desc">${item.desc}</div>
                    </div>
                    ${statusControlsHtml}
                </div>
                ${customControlsHtml}
                ${observationHtml}
            `;

            tasksList.appendChild(taskEl);

            const imgThumb = taskEl.querySelector(".task-image-preview");
            if (imgThumb) {
                imgThumb.addEventListener("click", () => {
                    openImageViewer(resp.image, item.title);
                });
            }
        });

        sectionBody.appendChild(tasksList);
        sectionCard.appendChild(sectionHeader);
        sectionCard.appendChild(sectionBody);
        elFloorsContainer.appendChild(sectionCard);
    });
}

function getSectionProgressText(section) {
    const total = section.items.length;
    let done = 0;
    section.items.forEach(item => {
        const resp = appState.responses[item.id];
        if (resp && (resp.status || resp.value || resp.notes || resp.count !== undefined || (resp.photos && resp.photos.length > 0))) {
            done++;
        }
    });
    return `${done} / ${total} Verificados`;
}

function updateItemValue(itemId, val) {
    if (!appState.responses[itemId]) appState.responses[itemId] = {};
    appState.responses[itemId].value = val;
    saveState();
    calculateMetrics();
}

function updateItemDualValue(itemId, field, val) {
    if (!appState.responses[itemId]) appState.responses[itemId] = {};
    appState.responses[itemId][field] = val;
    saveState();
    calculateMetrics();
}

function updateItemCount(itemId, val) {
    if (!appState.responses[itemId]) appState.responses[itemId] = {};
    appState.responses[itemId].count = val !== '' ? parseInt(val, 10) : '';
    saveState();
    calculateMetrics();
}

function updateItemNotes(itemId, val) {
    if (!appState.responses[itemId]) appState.responses[itemId] = {};
    appState.responses[itemId].notes = val;
    saveState();
    calculateMetrics();
}

function handleGeneralPhotosUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let readCount = 0;
    Array.from(files).forEach(file => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!appState.generalPhotos) appState.generalPhotos = [];
            appState.generalPhotos.push(e.target.result);
            readCount++;
            if (readCount === files.length) {
                saveState();
                renderFloors();
            }
        };
        reader.readAsDataURL(file);
    });
}

function deleteGeneralPhoto(index) {
    if (!appState.generalPhotos) return;
    appState.generalPhotos.splice(index, 1);
    saveState();
    renderFloors();
}

function setStatus(itemId, status) {
    if (!appState.responses[itemId]) {
        appState.responses[itemId] = { status: null, severity: "", notes: "", image: null };
    }

    if (appState.responses[itemId].status === status) {
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

function openObservationModal(itemId, title) {
    if (!elModalItemId || !elModalTitle) return;
    elModalItemId.value = itemId;
    elModalTitle.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Novedad: ${title}`;
    
    const resp = appState.responses[itemId] || {};
    if (elModalSeverity) elModalSeverity.value = resp.severity || "Media";
    if (elModalNotes) elModalNotes.value = resp.notes || "";

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
    
    if (elModal) elModal.classList.remove("hidden");
    if (elModalNotes) elModalNotes.focus();
}

function closeModal() {
    if (elModal) elModal.classList.add("hidden");
    tempAttachedImageBase64 = null;
    if (elModalImage) elModalImage.value = "";
    if (elFileUploadName) elFileUploadName.textContent = "Ninguna imagen seleccionada";
    if (elImagePreview) elImagePreview.src = "";
    if (elImagePreviewContainer) elImagePreviewContainer.classList.add("hidden");
}

function saveModalObservation() {
    const itemId = elModalItemId ? elModalItemId.value : null;
    if (itemId && appState.responses[itemId]) {
        if (elModalSeverity) appState.responses[itemId].severity = elModalSeverity.value;
        if (elModalNotes) appState.responses[itemId].notes = elModalNotes.value;
        appState.responses[itemId].image = tempAttachedImageBase64 || null;
        saveState();
        renderAll();
    }
    tempAttachedImageBase64 = null;
    closeModal();
}

function calculateMetrics() {
    let totalItems = 0;
    let okCount = 0;
    let issueCount = 0;
    let naCount = 0;

    DEFAULT_SECTIONS_DATA.forEach(section => {
        section.items.forEach(item => {
            totalItems++;
            const resp = appState.responses[item.id];
            if (resp) {
                if (resp.status === "ok") okCount++;
                if (resp.status === "issue") issueCount++;
                if (resp.status === "na") naCount++;
            }
        });
    });

    let answered = 0;
    DEFAULT_SECTIONS_DATA.forEach(section => {
        section.items.forEach(item => {
            const resp = appState.responses[item.id];
            if (resp && (resp.status || resp.value || resp.notes || resp.count !== undefined || (resp.photos && resp.photos.length > 0))) answered++;
        });
    });

    const progressPct = totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0;

    if (elValProgress) elValProgress.textContent = `${progressPct}%`;
    if (elBarProgress) elBarProgress.style.width = `${progressPct}%`;
    if (elValOk) elValOk.textContent = okCount;
    if (elValIssue) elValIssue.textContent = issueCount;
    if (elValNa) elValNa.textContent = naCount;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
