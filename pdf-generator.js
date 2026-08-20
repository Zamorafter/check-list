/**
 * Generador de Reporte PDF para el Checklist de Inspección de Guardia
 * Utiliza html2pdf.js / jsPDF para exportar un documento PDF ejecutivo.
 */

document.getElementById("btn-pdf").addEventListener("click", generatePDFReport);

function generatePDFReport() {
    const guardName = document.getElementById("guard-name").value.trim();
    if (!guardName) {
        alert("Por favor ingrese el nombre del Inspector / Guardia antes de generar el reporte PDF.");
        document.getElementById("guard-name").focus();
        return;
    }

    const pdfContainer = document.getElementById("pdf-template");
    pdfContainer.innerHTML = buildPDFHTML();
    pdfContainer.classList.remove("hidden");

    // Opciones para la generación de PDF
    const opt = {
        margin:       [10, 10, 10, 10], // top, left, bottom, right in mm
        filename:     `Informe_Guardia_Operativa_${formatDateForFile(new Date())}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Mostrar feedback de carga
    const btnPdf = document.getElementById("btn-pdf");
    const originalText = btnPdf.innerHTML;
    btnPdf.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...`;
    btnPdf.disabled = true;

    // Generar PDF
    html2pdf().set(opt).from(pdfContainer).save().then(() => {
        pdfContainer.classList.add("hidden");
        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;
    }).catch(err => {
        console.error("Error al generar PDF:", err);
        alert("Ocurrió un error al generar el PDF. Por favor intente nuevamente.");
        pdfContainer.classList.add("hidden");
        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;
    });
}

function buildPDFHTML() {
    const guardName = appState.guardName || "Sin registrar";
    const shiftType = appState.shiftType || "Fin de Semana";
    const dateStr = appState.inspectionDate ? new Date(appState.inspectionDate).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');
    const building = appState.buildingName || "Sede Principal";

    // Métricas
    let totalItems = 0, okCount = 0, issueCount = 0, naCount = 0;
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

    // Ordenar pisos para el PDF en sentido ascendente
    let sortedFloors = [...DEFAULT_FLOORS_DATA];
    sortedFloors.sort((a, b) => a.order - b.order);

    // Construcción de tablas de pisos
    let floorsHtml = "";
    let issuesList = [];

    sortedFloors.forEach(floor => {
        let rowsHtml = "";

        floor.items.forEach(item => {
            const resp = appState.responses[item.id] || { status: "Pendiente", severity: "", notes: "" };
            let statusBadge = `<span style="color: #64748b; font-weight: bold;">[ Pendiente ]</span>`;

            if (resp.status === "ok") {
                statusBadge = `<span style="color: #10b981; font-weight: bold;">✔ CONFORME</span>`;
            } else if (resp.status === "issue") {
                statusBadge = `<span style="color: #ef4444; font-weight: bold;">⚠ NOVEDAD</span>`;
                issuesList.push({
                    floor: floor.name,
                    category: item.category,
                    title: item.title,
                    severity: resp.severity || "Media",
                    notes: resp.notes || "Sin descripción de novedad.",
                    image: resp.image || null
                });
            } else if (resp.status === "na") {
                statusBadge = `<span style="color: #64748b; font-weight: bold;">- N/A</span>`;
            }

            rowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 8px; font-size: 11px; font-weight: bold; color: #1e293b;">${escapeHtml(item.category)}</td>
                    <td style="padding: 6px 8px; font-size: 11px; color: #334155;">
                        <strong>${escapeHtml(item.title)}</strong><br>
                        <span style="font-size: 9.5px; color: #64748b;">${escapeHtml(item.desc)}</span>
                        ${resp.image ? `<br><img src="${resp.image}" style="max-width: 120px; max-height: 80px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 3px;" alt="Evidencia">` : ''}
                    </td>
                    <td style="padding: 6px 8px; font-size: 11px; text-align: center;">${statusBadge}</td>
                </tr>
            `;
        });

        floorsHtml += `
            <div style="margin-bottom: 15px; page-break-inside: avoid;">
                <div style="background: #1e293b; color: #ffffff; padding: 6px 10px; font-size: 12px; font-weight: bold; border-radius: 4px 4px 0 0;">
                    📍 ${escapeHtml(floor.name)} (${floor.badge})
                </div>
                <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 10px; color: #475569; text-transform: uppercase;">
                            <th style="padding: 5px 8px; text-align: left; width: 25%;">Categoría</th>
                            <th style="padding: 5px 8px; text-align: left; width: 55%;">Punto de Control</th>
                            <th style="padding: 5px 8px; text-align: center; width: 20%;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    });

    // Desglose de Novedades
    let issuesHtml = "";
    if (issuesList.length > 0) {
        let issueRows = "";
        issuesList.forEach(iss => {
            let color = "#f59e0b";
            if (iss.severity === "Alta") color = "#ef4444";
            if (iss.severity === "Baja") color = "#3b82f6";

            issueRows += `
                <tr style="border-bottom: 1px solid #fee2e2;">
                    <td style="padding: 6px 8px; font-size: 10.5px; font-weight: bold;">${escapeHtml(iss.floor)}</td>
                    <td style="padding: 6px 8px; font-size: 10.5px;">${escapeHtml(iss.title)}</td>
                    <td style="padding: 6px 8px; font-size: 10px; text-align: center;"><span style="background: ${color}; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${iss.severity}</span></td>
                    <td style="padding: 6px 8px; font-size: 10.5px; color: #1e293b;">
                        ${escapeHtml(iss.notes)}
                        ${iss.image ? `<br><img src="${iss.image}" style="max-width: 100px; max-height: 70px; margin-top: 4px; border: 1px solid #fca5a5; border-radius: 3px;" alt="Evidencia">` : ''}
                    </td>
                </tr>
            `;
        });

        issuesHtml = `
            <div style="margin-top: 20px; page-break-inside: avoid;">
                <div style="background: #ef4444; color: #ffffff; padding: 6px 10px; font-size: 12px; font-weight: bold; border-radius: 4px 4px 0 0;">
                    ⚠ NOVEDADES E INCIDENCIAS DETECTADAS (${issuesList.length})
                </div>
                <table style="width: 100%; border-collapse: collapse; background: #fff5f5; border: 1px solid #fca5a5;">
                    <thead>
                        <tr style="background: #fee2e2; border-bottom: 1px solid #fca5a5; font-size: 10px; color: #991b1b; text-transform: uppercase;">
                            <th style="padding: 5px 8px; text-align: left; width: 20%;">Ubicación</th>
                            <th style="padding: 5px 8px; text-align: left; width: 30%;">Punto afectado</th>
                            <th style="padding: 5px 8px; text-align: center; width: 15%;">Prioridad</th>
                            <th style="padding: 5px 8px; text-align: left; width: 35%;">Observación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${issueRows}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        issuesHtml = `
            <div style="margin-top: 15px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; color: #166534; font-size: 11px; text-align: center; font-weight: bold;">
                ✔ No se registraron novedades ni anomalías durante el recorrido de esta guardia.
            </div>
        `;
    }


    return `
        <div style="font-family: Arial, sans-serif; color: #0f172a; padding: 10px; background: #ffffff;">
            <!-- Encabezado Corporativo -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 15px;">
                <div>
                    <h1 style="font-size: 18px; margin: 0; color: #0f172a; text-transform: uppercase;">ACTA DE INSPECCIÓN OPERATIVA DE GUARDIA</h1>
                    <p style="font-size: 11px; margin: 2px 0 0 0; color: #475569;">Fines de semana & Días Feriados | Departamento de Operaciones</p>
                </div>
                <div style="text-align: right; font-size: 10px; color: #64748b;">
                    <strong>Documento Oficial</strong><br>
                    Emisión: ${new Date().toLocaleDateString('es-ES')}
                </div>
            </div>

            <!-- Metadatos de la Inspección -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 11px;">
                <div>
                    <strong>Inspector de Guardia:</strong> ${escapeHtml(guardName)}<br>
                    <strong>Tipo de Turno:</strong> ${escapeHtml(shiftType)}<br>
                    <strong>Sede / Edificio:</strong> ${escapeHtml(building)}
                </div>
                <div>
                    <strong>Fecha / Hora Inicio:</strong> ${escapeHtml(dateStr)}<br>
                    <strong>Cumplimiento:</strong> <span style="color: #10b981; font-weight: bold;">${progressPct}% Completado</span>
                </div>
            </div>

            <!-- Resumen Estadístico -->
            <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 15px; text-align: center; font-size: 10px;">
                <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 14px; color: #1d4ed8;">${answered} / ${totalItems}</strong><br>
                    <span style="color: #1e40af;">Total Verificados</span>
                </div>
                <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 14px; color: #15803d;">${okCount}</strong><br>
                    <span style="color: #166534;">Conformes (OK)</span>
                </div>
                <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 14px; color: #b91c1c;">${issueCount}</strong><br>
                    <span style="color: #991b1b;">Novedades</span>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 14px; color: #475569;">${naCount}</strong><br>
                    <span style="color: #334155;">No Aplica (N/A)</span>
                </div>
            </div>

            <!-- Tablas de Inspección por Pisos -->
            ${floorsHtml}

            <!-- Tabla de Novedades -->
            ${issuesHtml}

        </div>
    `;
}

function formatDateForFile(date) {
    return date.toISOString().slice(0, 10);
}
