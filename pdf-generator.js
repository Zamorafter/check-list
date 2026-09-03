/**
 * Generador de Reporte PDF para el Checklist de Inspección de Guardia Operativa
 * Exporta un acta corporativa estructurada por departamentos con asistencias, métricas y evidencias.
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
    const shiftTimeSlot = appState.shiftTimeSlot || "10:00 AM";
    const dateStr = appState.inspectionDate ? new Date(appState.inspectionDate).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');
    const building = appState.buildingName || "Sede Principal";
    const lightingStatus = appState.lightingStatus || "N/A";
    const commercialHoursStatus = appState.commercialHoursStatus || "N/A";

    // Métricas globales
    let totalItems = 0, okCount = 0, issueCount = 0, naCount = 0, answered = 0;
    DEFAULT_SECTIONS_DATA.forEach(section => {
        section.items.forEach(item => {
            totalItems++;
            const resp = appState.responses[item.id];
            if (resp) {
                if (resp.status === "ok") okCount++;
                if (resp.status === "issue") issueCount++;
                if (resp.status === "na") naCount++;
                if (resp.status || resp.value || resp.notes || (resp.photos && resp.photos.length > 0)) answered++;
            }
        });
    });

    const progressPct = totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0;

    let sortedSections = [...DEFAULT_SECTIONS_DATA];
    sortedSections.sort((a, b) => a.order - b.order);

    let sectionsHtml = "";
    let issuesList = [];

    sortedSections.forEach(section => {
        let rowsHtml = "";

        section.items.forEach(item => {
            const resp = appState.responses[item.id] || {};
            let statusBadge = `<span style="color: #64748b; font-weight: bold;">[ Pendiente ]</span>`;

            if (resp.status === "ok") {
                statusBadge = `<span style="color: #10b981; font-weight: bold;">✔ CONFORME / OPERATIVO</span>`;
            } else if (resp.status === "issue") {
                statusBadge = `<span style="color: #ef4444; font-weight: bold;">⚠ NOVEDAD</span>`;
                issuesList.push({
                    section: section.name,
                    category: item.category,
                    title: item.title,
                    severity: resp.severity || "Media",
                    notes: resp.notes || "Sin descripción de novedad.",
                    image: resp.image || null
                });
            } else if (resp.status === "na") {
                statusBadge = `<span style="color: #64748b; font-weight: bold;">- N/A</span>`;
            }

            // Construir detalle del valor o notas si existen
            let detailContentHtml = "";
            if (item.type === "value_input" && resp.value) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10.5px; color: #1e293b;"><strong>Valor Registrado:</strong> ${escapeHtml(resp.value)}</div>`;
            } else if (item.type === "dual_value" && (resp.val1 || resp.val2)) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10.5px; color: #1e293b;"><strong>Suministro:</strong> ${escapeHtml(resp.val1 || 'N/D')} | <strong>Retorno:</strong> ${escapeHtml(resp.val2 || 'N/D')}</div>`;
            } else if (item.type === "status_counter" && resp.count !== undefined) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10.5px; color: #1e293b;"><strong>Equipos Disponibles:</strong> ${resp.count} de ${item.max || 10}</div>`;
            } else if (item.type === "text_notes_photo" && resp.notes) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10.5px; color: #1e293b; white-space: pre-wrap;">${escapeHtml(resp.notes)}</div>`;
            }

            // Si hay imagen adjunta en la respuesta
            let imageHtml = "";
            if (resp.image) {
                imageHtml = `<br><img src="${resp.image}" style="max-width: 120px; max-height: 80px; margin-top: 4px; border: 1px solid #cbd5e1; border-radius: 3px;" alt="Evidencia">`;
            }

            // Si es la sección de fotos generales
            if (item.type === "general_photos_gallery") {
                if (appState.generalPhotos && appState.generalPhotos.length > 0) {
                    let photoThumbs = appState.generalPhotos.map(p => `
                        <img src="${p}" style="width: 110px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" alt="Foto General">
                    `).join("");
                    detailContentHtml = `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">${photoThumbs}</div>`;
                } else {
                    detailContentHtml = `<span style="font-size: 10px; color: #94a3b8;">Sin fotos generales adjuntas.</span>`;
                }
            }

            rowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 8px; font-size: 11px; font-weight: bold; color: #1e293b; width: 25%;">${escapeHtml(item.category)}</td>
                    <td style="padding: 6px 8px; font-size: 11px; color: #334155; width: 55%;">
                        <strong>${escapeHtml(item.title)}</strong><br>
                        <span style="font-size: 9.5px; color: #64748b;">${escapeHtml(item.desc)}</span>
                        ${detailContentHtml}
                        ${imageHtml}
                    </td>
                    <td style="padding: 6px 8px; font-size: 11px; text-align: center; width: 20%;">${statusBadge}</td>
                </tr>
            `;
        });

        sectionsHtml += `
            <div style="margin-bottom: 15px; page-break-inside: avoid;">
                <div style="background: #1e293b; color: #ffffff; padding: 6px 10px; font-size: 12px; font-weight: bold; border-radius: 4px 4px 0 0;">
                    📍 ${escapeHtml(section.name)}
                </div>
                <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 10px; color: #475569; text-transform: uppercase;">
                            <th style="padding: 5px 8px; text-align: left; width: 25%;">Departamento</th>
                            <th style="padding: 5px 8px; text-align: left; width: 55%;">Punto de Control / Lectura</th>
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
                    <td style="padding: 6px 8px; font-size: 10.5px; font-weight: bold;">${escapeHtml(iss.section)}</td>
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
                            <th style="padding: 5px 8px; text-align: left; width: 25%;">Sección</th>
                            <th style="padding: 5px 8px; text-align: left; width: 30%;">Punto Afectado</th>
                            <th style="padding: 5px 8px; text-align: center; width: 15%;">Prioridad</th>
                            <th style="padding: 5px 8px; text-align: left; width: 30%;">Observación</th>
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
                ✔ No se registraron novedades ni anomalías críticas durante este recorrido.
            </div>
        `;
    }

    return `
        <div style="font-family: Arial, sans-serif; color: #0f172a; padding: 10px; background: #ffffff;">
            <!-- Encabezado Corporativo -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 15px;">
                <div>
                    <h1 style="font-size: 18px; margin: 0; color: #0f172a; text-transform: uppercase;">ACTA DE INSPECCIÓN OPERATIVA DE GUARDIA</h1>
                    <p style="font-size: 11px; margin: 2px 0 0 0; color: #475569;">Control de Servicios & Operaciones | Mall / Edificio Principal</p>
                </div>
                <div style="text-align: right; font-size: 10px; color: #64748b;">
                    <strong>Documento Oficial</strong><br>
                    Emisión: ${new Date().toLocaleDateString('es-ES')}
                </div>
            </div>

            <!-- Metadatos de la Inspección -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 11px;">
                <div>
                    <strong>Inspector de Guardia:</strong> ${escapeHtml(guardName)}<br>
                    <strong>Horario de Recorrido:</strong> <span style="color: #0284c7; font-weight: bold;">${escapeHtml(shiftTimeSlot)}</span><br>
                    <strong>Sede / Edificio:</strong> ${escapeHtml(building)}
                </div>
                <div>
                    <strong>Fecha / Hora:</strong> ${escapeHtml(dateStr)}<br>
                    <strong>Cumplimiento de Recorrido:</strong> <span style="color: #10b981; font-weight: bold;">${progressPct}% Completado</span>
                </div>
            </div>

            <!-- Evaluaciones de Control General (Iluminación & Horario Comercial) -->
            <div style="display: flex; gap: 10px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px 10px; border-radius: 4px; margin-bottom: 15px; font-size: 10.5px;">
                <div style="flex: 1;">
                    <strong>Iluminación Perimetral/Interna:</strong> 
                    <span style="font-weight: bold; color: ${lightingStatus === 'Cumplió' ? '#166534' : '#991b1b'};">${escapeHtml(lightingStatus)}</span>
                </div>
                <div style="flex: 1;">
                    <strong>Aliados Comerciales (Horario):</strong> 
                    <span style="font-weight: bold; color: ${commercialHoursStatus === 'Cumplieron' ? '#166534' : '#991b1b'};">${escapeHtml(commercialHoursStatus)}</span>
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

            <!-- Tablas de Inspección por Departamentos -->
            ${sectionsHtml}

            <!-- Tabla de Novedades -->
            ${issuesHtml}

        </div>
    `;
}

function formatDateForFile(date) {
    return date.toISOString().slice(0, 10);
}
