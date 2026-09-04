/**
 * Generador de Reporte PDF para el Checklist de Inspección de Guardia Operativa
 * Exporta un acta corporativa estructurada por departamentos con asistencias, métricas y evidencias.
 */

document.getElementById("btn-pdf").addEventListener("click", generatePDFReport);

function generatePDFReport() {
    const guardName = (document.getElementById("guard-name") ? document.getElementById("guard-name").value : appState.guardName || "").trim();
    if (!guardName) {
        alert("Por favor ingrese el nombre del Inspector / Guardia antes de generar el reporte PDF.");
        if (document.getElementById("guard-name")) document.getElementById("guard-name").focus();
        return;
    }

    const pdfContainer = document.getElementById("pdf-template");
    pdfContainer.innerHTML = buildPDFHTML();
    pdfContainer.classList.remove("hidden");

    const opt = {
        margin:       [8, 8, 8, 8], // top, left, bottom, right in mm
        filename:     `Informe_Guardia_Operativa_${formatDateForFile(appState.inspectionDate || new Date())}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const btnPdf = document.getElementById("btn-pdf");
    const originalText = btnPdf.innerHTML;
    btnPdf.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...`;
    btnPdf.disabled = true;

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
    const rawDate = appState.inspectionDate ? appState.inspectionDate.substring(0, 10) : new Date().toISOString().substring(0, 10);
    const dateStr = formatDisplayDate(rawDate);
    const building = appState.buildingName || "Sede Principal - Edificio Operativo";

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
                if (resp.status || resp.value || resp.notes || resp.count !== undefined || (resp.photos && resp.photos.length > 0)) answered++;
            }
        });
    });

    // Novedades dinámicas de la sección 8
    const writtenNovs = (appState.novedadesList || []).filter(n => n.notes && n.notes.trim().length > 0);
    issueCount += writtenNovs.length;
    if (writtenNovs.length > 0) answered++;

    const progressPct = totalItems > 0 ? Math.round((answered / totalItems) * 100) : 0;

    let sortedSections = [...DEFAULT_SECTIONS_DATA];
    sortedSections.sort((a, b) => a.order - b.order);

    let sectionsHtml = "";
    let issuesList = [];

    sortedSections.forEach(section => {
        let rowsHtml = "";

        section.items.forEach(item => {
            const resp = appState.responses[item.id] || {};
            let statusBadge = `<span style="color: #64748b; font-weight: 600;">[ Pendiente ]</span>`;

            if (resp.status === "ok") {
                statusBadge = `<span style="color: #059669; font-weight: 700;">✔ OPERATIVO</span>`;
            } else if (resp.status === "issue") {
                statusBadge = `<span style="color: #dc2626; font-weight: 700;">⚠ NO OPERATIVO</span>`;
                issuesList.push({
                    section: section.name,
                    category: item.category,
                    title: item.title,
                    notes: resp.notes || "Sin descripción detallada.",
                    image: resp.image || null
                });
            } else if (resp.status === "na") {
                statusBadge = `<span style="color: #64748b; font-weight: 600;">- N/A</span>`;
            }

            // Construir detalle del valor o notas si existen
            let detailContentHtml = "";
            if (item.type === "asistencia_counter" && resp.count !== undefined && resp.count !== null && resp.count !== "") {
                const labelText = item.counterLabel || "Personas Presentes";
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10px; color: #1e293b;"><strong>${escapeHtml(labelText)}:</strong> ${resp.count}</div>`;
            } else if (item.type === "value_input" && resp.value) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10px; color: #1e293b;"><strong>Valor Registrado:</strong> ${escapeHtml(resp.value)}</div>`;
            } else if (item.type === "dual_value" && (resp.val1 || resp.val2)) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10px; color: #1e293b;"><strong>Suministro:</strong> ${escapeHtml(resp.val1 || 'N/D')} | <strong>Retorno:</strong> ${escapeHtml(resp.val2 || 'N/D')}</div>`;
            } else if (item.type === "status_counter" && resp.count !== undefined) {
                detailContentHtml = `<div style="margin-top: 3px; font-size: 10px; color: #1e293b;"><strong>Equipos Disponibles:</strong> ${resp.count} de ${item.max || 10}</div>`;
            }

            let imageHtml = "";
            if (resp.image) {
                imageHtml = `<div style="margin-top: 4px;"><img src="${resp.image}" style="max-width: 120px; max-height: 85px; object-fit: cover; border: 1px solid #cbd5e1; border-radius: 4px;" alt="Evidencia"></div>`;
            }

            // Si es la sección de novedades dinámicas
            if (item.type === "dynamic_novedades_list") {
                if (writtenNovs.length > 0) {
                    let novsSummary = writtenNovs.map((n, idx) => `
                        <div style="margin-top: 6px; padding: 6px 8px; background: #fff5f5; border-left: 3px solid #ef4444; border-radius: 3px;">
                            <strong style="color: #991b1b; font-size: 10.5px;">Novedad #${idx + 1}:</strong>
                            <div style="font-size: 10px; color: #334155; margin-top: 2px;">${escapeHtml(n.notes)}</div>
                            ${n.image ? `<img src="${n.image}" style="max-width: 110px; max-height: 75px; object-fit: cover; margin-top: 4px; border: 1px solid #fca5a5; border-radius: 3px;" alt="Foto Novedad">` : ''}
                        </div>
                    `).join("");
                    detailContentHtml = `<div>${novsSummary}</div>`;
                    statusBadge = `<span style="color: #dc2626; font-weight: 700;">${writtenNovs.length} Novedad(es)</span>`;
                } else {
                    detailContentHtml = `<span style="font-size: 10px; color: #64748b;">Sin novedades registradas en este recorrido.</span>`;
                    statusBadge = `<span style="color: #059669; font-weight: 700;">✔ Sin Novedad</span>`;
                }
            }

            // Si es la sección de fotos generales
            if (item.type === "general_photos_gallery") {
                if (appState.generalPhotos && appState.generalPhotos.length > 0) {
                    let photoThumbs = appState.generalPhotos.map(p => `
                        <img src="${p}" style="width: 110px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" alt="Foto General">
                    `).join("");
                    detailContentHtml = `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">${photoThumbs}</div>`;
                    statusBadge = `<span style="color: #059669; font-weight: 700;">${appState.generalPhotos.length} Fotos</span>`;
                } else {
                    detailContentHtml = `<span style="font-size: 10px; color: #94a3b8;">Sin fotos generales adjuntas.</span>`;
                    statusBadge = `<span style="color: #64748b;">0 Fotos</span>`;
                }
            }

            rowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 8px; font-size: 10.5px; font-weight: bold; color: #1e293b; width: 25%; vertical-align: top;">${escapeHtml(item.category)}</td>
                    <td style="padding: 6px 8px; font-size: 10.5px; color: #334155; width: 55%; vertical-align: top;">
                        <strong>${escapeHtml(item.title)}</strong><br>
                        <span style="font-size: 9px; color: #64748b;">${escapeHtml(item.desc)}</span>
                        ${detailContentHtml}
                        ${imageHtml}
                    </td>
                    <td style="padding: 6px 8px; font-size: 10px; text-align: center; width: 20%; vertical-align: middle;">${statusBadge}</td>
                </tr>
            `;
        });

        sectionsHtml += `
            <div style="margin-bottom: 14px; page-break-inside: avoid;">
                <div style="background: #1e293b; color: #ffffff; padding: 6px 10px; font-size: 11.5px; font-weight: bold; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between;">
                    <span>📍 ${escapeHtml(section.name)}</span>
                </div>
                <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; font-size: 9.5px; color: #475569; text-transform: uppercase;">
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

    // Agregar las novedades dinámicas escritas al listado general de novedades para la tabla final
    writtenNovs.forEach((n, idx) => {
        issuesList.push({
            section: "8. Reporte Escrito de Novedades",
            category: "Novedades",
            title: `Novedad #${idx + 1}`,
            notes: n.notes,
            image: n.image
        });
    });

    // Tabla de Desglose de Novedades (SIN columna de severidad)
    let issuesHtml = "";
    if (issuesList.length > 0) {
        let issueRows = "";
        issuesList.forEach((iss, i) => {
            issueRows += `
                <tr style="border-bottom: 1px solid #fee2e2;">
                    <td style="padding: 6px 8px; font-size: 10px; font-weight: bold; width: 25%; vertical-align: top; color: #991b1b;">
                        ${i + 1}. ${escapeHtml(iss.section)}
                    </td>
                    <td style="padding: 6px 8px; font-size: 10px; font-weight: 600; width: 25%; vertical-align: top;">
                        ${escapeHtml(iss.title)}
                    </td>
                    <td style="padding: 6px 8px; font-size: 10px; color: #1e293b; width: 50%; vertical-align: top;">
                        <div>${escapeHtml(iss.notes)}</div>
                        ${iss.image ? `<div style="margin-top: 4px;"><img src="${iss.image}" style="max-width: 120px; max-height: 80px; object-fit: cover; border: 1px solid #fca5a5; border-radius: 3px;" alt="Evidencia"></div>` : ''}
                    </td>
                </tr>
            `;
        });

        issuesHtml = `
            <div style="margin-top: 16px; margin-bottom: 16px; page-break-inside: avoid;">
                <div style="background: #dc2626; color: #ffffff; padding: 6px 10px; font-size: 12px; font-weight: bold; border-radius: 4px 4px 0 0;">
                    ⚠ DETALLE DE NOVEDADES E INCIDENCIAS REGISTRADAS (${issuesList.length})
                </div>
                <table style="width: 100%; border-collapse: collapse; background: #fffbfb; border: 1px solid #fca5a5;">
                    <thead>
                        <tr style="background: #fee2e2; border-bottom: 1px solid #fca5a5; font-size: 9.5px; color: #991b1b; text-transform: uppercase;">
                            <th style="padding: 5px 8px; text-align: left; width: 25%;">Departamento / Sección</th>
                            <th style="padding: 5px 8px; text-align: left; width: 25%;">Punto Afectado</th>
                            <th style="padding: 5px 8px; text-align: left; width: 50%;">Descripción y Evidencia</th>
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
            <div style="margin-top: 14px; margin-bottom: 14px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; color: #166534; font-size: 11px; text-align: center; font-weight: bold; page-break-inside: avoid;">
                ✔ No se registraron novedades ni incidencias operativas durante este recorrido.
            </div>
        `;
    }

    return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 8px; background: #ffffff; line-height: 1.4;">
            <!-- Encabezado Corporativo -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px;">
                <div>
                    <h1 style="font-size: 17px; margin: 0; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em;">ACTA DE INSPECCIÓN OPERATIVA DE GUARDIA</h1>
                    <p style="font-size: 10.5px; margin: 2px 0 0 0; color: #475569;">Control de Servicios & Operaciones | Fines de Semana y Feriados</p>
                </div>
                <div style="text-align: right; font-size: 9.5px; color: #64748b;">
                    <strong style="color: #0f172a;">Documento Oficial</strong><br>
                    Emisión: ${new Date().toLocaleDateString('es-ES')}
                </div>
            </div>

            <!-- Metadatos de la Inspección -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10.5px;">
                <div>
                    <strong>Inspector de Guardia:</strong> ${escapeHtml(guardName)}<br>
                    <strong>Horario del Recorrido:</strong> <span style="color: #0284c7; font-weight: bold;">${escapeHtml(shiftTimeSlot)}</span><br>
                    <strong>Sede / Edificio:</strong> ${escapeHtml(building)}
                </div>
                <div>
                    <strong>Fecha:</strong> <span style="font-weight: 600; color: #0f172a;">${escapeHtml(dateStr)}</span><br>
                    <strong>Nivel de Cobertura:</strong> <span style="color: #059669; font-weight: bold;">${progressPct}% Completado</span>
                </div>
            </div>

            <!-- Resumen Estadístico -->
            <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 14px; text-align: center; font-size: 10px; page-break-inside: avoid;">
                <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 13px; color: #1d4ed8;">${answered} / ${totalItems}</strong><br>
                    <span style="color: #1e40af; font-size: 9.5px;">Total Verificados</span>
                </div>
                <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 13px; color: #15803d;">${okCount}</strong><br>
                    <span style="color: #166534; font-size: 9.5px;">Operativos / Conformes</span>
                </div>
                <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 13px; color: #b91c1c;">${issueCount}</strong><br>
                    <span style="color: #991b1b; font-size: 9.5px;">Novedades</span>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px; border-radius: 4px;">
                    <strong style="font-size: 13px; color: #475569;">${naCount}</strong><br>
                    <span style="color: #334155; font-size: 9.5px;">No Aplica (N/A)</span>
                </div>
            </div>

            <!-- Tablas de Inspección por Departamentos -->
            ${sectionsHtml}

            <!-- Tabla de Novedades -->
            ${issuesHtml}

            <!-- Firmas de Responsabilidad -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 10px; text-align: center; page-break-inside: avoid;">
                <div>
                    <div style="border-top: 1px solid #0f172a; margin: 35px 25px 5px 25px;"></div>
                    <strong>${escapeHtml(guardName)}</strong><br>
                    <span style="color: #64748b;">Inspector / Guardia de Turno</span>
                </div>
                <div>
                    <div style="border-top: 1px solid #0f172a; margin: 35px 25px 5px 25px;"></div>
                    <strong>Supervisor de Operaciones / Seguridad</strong><br>
                    <span style="color: #64748b;">Revisado y Conforme</span>
                </div>
            </div>
        </div>
    `;
}

function formatDisplayDate(dateString) {
    if (!dateString) return new Date().toLocaleDateString('es-ES');
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            return dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

function formatDateForFile(dateInput) {
    if (typeof dateInput === 'string') {
        return dateInput.substring(0, 10);
    }
    return dateInput.toISOString().slice(0, 10);
}
