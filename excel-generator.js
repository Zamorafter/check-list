/**
 * Generador de Reporte Excel (.xlsx) para el Checklist de Inspección de Guardia
 * Utiliza SheetJS (xlsx) para exportar un libro estructurado con formato corporativo.
 */

document.addEventListener("DOMContentLoaded", () => {
    const btnExcel = document.getElementById("btn-excel");
    if (btnExcel) {
        btnExcel.addEventListener("click", generateExcelReport);
    }
});

function generateExcelReport() {
    if (typeof XLSX === "undefined") {
        alert("La librería de exportación a Excel no está disponible. Verifique su conexión a internet.");
        return;
    }

    const guardName = (document.getElementById("guard-name") ? document.getElementById("guard-name").value : appState.guardName || "").trim();
    if (!guardName) {
        alert("Por favor ingrese el nombre del Inspector / Guardia antes de generar el reporte Excel.");
        if (document.getElementById("guard-name")) document.getElementById("guard-name").focus();
        return;
    }

    const btnExcel = document.getElementById("btn-excel");
    const originalText = btnExcel ? btnExcel.innerHTML : "";
    if (btnExcel) {
        btnExcel.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando Excel...`;
        btnExcel.disabled = true;
    }

    try {
        const wb = XLSX.utils.book_new();

        // 1. Hoja "Inspección General"
        const generalSheetData = buildGeneralSheetData();
        const wsGeneral = XLSX.utils.aoa_to_sheet(generalSheetData);
        wsGeneral['!cols'] = [
            { wch: 6 },  // N°
            { wch: 32 }, // Departamento / Sección
            { wch: 38 }, // Punto de Control
            { wch: 22 }, // Estado
            { wch: 45 }  // Lectura / Novedades / Observación
        ];
        XLSX.utils.book_append_sheet(wb, wsGeneral, "Inspección General");

        // 2. Hoja "Novedades e Incidencias"
        const novedadesSheetData = buildNovedadesSheetData();
        const wsNovedades = XLSX.utils.aoa_to_sheet(novedadesSheetData);
        wsNovedades['!cols'] = [
            { wch: 6 },  // N°
            { wch: 30 }, // Origen / Sección
            { wch: 30 }, // Punto Afectado
            { wch: 55 }, // Descripción de la Novedad
            { wch: 20 }  // Evidencia Fotográfica
        ];
        XLSX.utils.book_append_sheet(wb, wsNovedades, "Novedades");

        // 3. Hoja "Asistencias y Tráfico"
        const asistenciasSheetData = buildAsistenciasSheetData();
        const wsAsistencias = XLSX.utils.aoa_to_sheet(asistenciasSheetData);
        wsAsistencias['!cols'] = [
            { wch: 35 }, // Categoría / Grupo
            { wch: 22 }, // Cantidad Registrada
            { wch: 45 }  // Observaciones
        ];
        XLSX.utils.book_append_sheet(wb, wsAsistencias, "Asistencias y Tráfico");

        const rawDate = appState.inspectionDate ? appState.inspectionDate.substring(0, 10) : new Date().toISOString().substring(0, 10);
        const fileName = `Informe_Guardia_Operativa_${rawDate}.xlsx`;

        XLSX.writeFile(wb, fileName);
    } catch (err) {
        console.error("Error al exportar Excel:", err);
        alert("Ocurrió un error al generar el archivo Excel.");
    } finally {
        if (btnExcel) {
            btnExcel.innerHTML = originalText;
            btnExcel.disabled = false;
        }
    }
}

function buildGeneralSheetData() {
    const rawDate = appState.inspectionDate ? appState.inspectionDate.substring(0, 10) : new Date().toISOString().substring(0, 10);
    const shift = appState.shiftTimeSlot || "10:00 AM";
    const guard = appState.guardName || "Sin registrar";
    const building = appState.buildingName || "Sede Principal";

    let okCount = 0, issueCount = 0, naCount = 0, totalItems = 0, answered = 0;
    DEFAULT_SECTIONS_DATA.forEach(sec => {
        sec.items.forEach(it => {
            totalItems++;
            const r = appState.responses[it.id];
            if (r) {
                if (r.status === "ok") okCount++;
                if (r.status === "issue") issueCount++;
                if (r.status === "na") naCount++;
                if (r.status || r.value || r.notes || r.count !== undefined || (r.photos && r.photos.length > 0)) answered++;
            }
        });
    });

    const writtenNovs = (appState.novedadesList || []).filter(n => n.notes && n.notes.trim().length > 0);
    issueCount += writtenNovs.length;
    if (writtenNovs.length > 0) answered++;

    const progressPct = totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0;

    const data = [
        ["ACTA DE INSPECCIÓN OPERATIVA DE GUARDIA"],
        ["Control de Servicios, Operaciones & Seguridad"],
        [],
        ["Inspector de Guardia:", guard, "", "Fecha:", rawDate],
        ["Horario de Recorrido:", shift, "", "Sede / Edificio:", building],
        ["Porcentaje de Avance:", `${progressPct}%`, "", "Fecha Emisión:", new Date().toLocaleDateString('es-ES')],
        [],
        ["RESUMEN ESTADÍSTICO DE INSPECCIÓN"],
        ["Total Puntos Evaluados", "Conformes / Operativos", "Novedades Detectadas", "No Aplica (N/A)"],
        [totalItems, okCount, issueCount, naCount],
        [],
        ["N°", "Departamento / Sección", "Punto de Control", "Estado / Condición", "Lectura / Observación"]
    ];

    let rowNum = 1;
    let sortedSections = [...DEFAULT_SECTIONS_DATA];
    sortedSections.sort((a, b) => a.order - b.order);

    sortedSections.forEach(sec => {
        sec.items.forEach(it => {
            const resp = appState.responses[it.id] || {};
            let statusText = "PENDIENTE";
            let detail = "";

            if (resp.status === "ok") statusText = "OPERATIVO / CONFORME";
            else if (resp.status === "issue") statusText = "NO OPERATIVO / NOVEDAD";
            else if (resp.status === "na") statusText = "N/A (No Aplica)";

            if (it.type === "asistencia_counter" && resp.count !== undefined && resp.count !== "") {
                detail = `${resp.count} ${it.counterLabel || 'Personas'}`;
            } else if (it.type === "value_input" && resp.value) {
                detail = `Valor: ${resp.value}`;
            } else if (it.type === "dual_value" && (resp.val1 || resp.val2)) {
                detail = `Suministro: ${resp.val1 || 'N/D'} | Retorno: ${resp.val2 || 'N/D'}`;
            } else if (it.type === "status_counter" && resp.count !== undefined) {
                detail = `Equipos disponibles: ${resp.count} de ${it.max || 10}`;
            }

            if (resp.notes) {
                detail = detail ? `${detail} | Obs: ${resp.notes}` : resp.notes;
            }
            if (resp.image) {
                detail = detail ? `${detail} [Evidencia fotográfica adjunta]` : `[Evidencia fotográfica adjunta]`;
            }

            if (it.type === "dynamic_novedades_list") {
                statusText = writtenNovs.length > 0 ? `${writtenNovs.length} Novedades` : "Sin Novedades";
                detail = writtenNovs.map((n, i) => `#${i + 1}: ${n.notes}${n.image ? ' [Con Foto]' : ''}`).join(" // ");
            }

            if (it.type === "general_photos_gallery") {
                const count = appState.generalPhotos ? appState.generalPhotos.length : 0;
                statusText = `${count} Fotos`;
                detail = `${count} fotografías registradas en galería`;
            }

            data.push([rowNum++, sec.name, it.title, statusText, detail]);
        });
    });

    return data;
}

function buildNovedadesSheetData() {
    const data = [
        ["DETALLE DE NOVEDADES E INCIDENCIAS REGISTRADAS"],
        ["Guardia Operativa - Inspección de Instalaciones"],
        [],
        ["N°", "Departamento / Sección", "Punto Afectado", "Descripción Detallada de la Novedad", "Evidencia Fotográfica"]
    ];

    let count = 1;
    DEFAULT_SECTIONS_DATA.forEach(sec => {
        sec.items.forEach(it => {
            const resp = appState.responses[it.id] || {};
            if (resp.status === "issue") {
                data.push([
                    count++,
                    sec.name,
                    it.title,
                    resp.notes || "Sin descripción",
                    resp.image ? "Sí (Adjunta)" : "No"
                ]);
            }
        });
    });

    const writtenNovs = (appState.novedadesList || []).filter(n => n.notes && n.notes.trim().length > 0);
    writtenNovs.forEach((n, idx) => {
        data.push([
            count++,
            "8. Reporte Escrito de Novedades",
            `Novedad #${idx + 1}`,
            n.notes,
            n.image ? "Sí (Adjunta)" : "No"
        ]);
    });

    if (count === 1) {
        data.push(["-", "Todas las secciones", "Sin novedades", "No se detectaron novedades en este recorrido", "N/A"]);
    }

    return data;
}

function buildAsistenciasSheetData() {
    const data = [
        ["REGISTRO DE ASISTENCIAS DE PERSONAL & CONTRATISTAS"],
        [],
        ["Personal / Contratista", "Cantidad Registrada", "Novedades / Observaciones"]
    ];

    const secAsist = DEFAULT_SECTIONS_DATA.find(s => s.id === "sec-asistencias");
    if (secAsist) {
        secAsist.items.forEach(it => {
            const resp = appState.responses[it.id] || {};
            const cant = resp.count !== undefined && resp.count !== "" ? resp.count : "No registrado";
            const obs = resp.notes || (resp.status === "issue" ? "Con Novedad" : "Conforme");
            data.push([it.title, cant, obs]);
        });
    }

    data.push([]);
    data.push(["AFLUENCIA Y TRÁFICO DE VISITANTES (7:00 PM)"]);
    data.push([]);
    data.push(["Métrica", "Conteo Registrado", "Observaciones"]);

    const respPersonas = appState.responses["trafico-personas"] || {};
    const respCarros = appState.responses["trafico-carros"] || {};

    data.push(["Conteo de Personas (Visitantes)", respPersonas.value || "No registrado", respPersonas.notes || ""]);
    data.push(["Conteo de Carros / Vehículos", respCarros.value || "No registrado", respCarros.notes || ""]);

    return data;
}
