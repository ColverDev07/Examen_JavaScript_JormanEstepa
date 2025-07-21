// --- Utilidades ---
function generarId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function leerFerias() {
    return JSON.parse(localStorage.getItem('ferias') || '[]');
}

function guardarFerias(ferias) {
    localStorage.setItem('ferias', JSON.stringify(ferias));
}

function ordenarFeriasPorFecha(ferias) {
    return ferias.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
}

// --- Validaciones auxiliares ---
function esHorarioValido(horario) {
    // Ejemplo simple: 8:00am - 5:00pm
    return /^\d{1,2}:\d{2}(am|pm)\s*-\s*\d{1,2}:\d{2}(am|pm)$/i.test(horario.trim());
}
function esURLValida(url) {
    if (!url) return true;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
function mostrarError(input, mensaje) {
    input.classList.add('input-error');
    if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-msg')) {
        const error = document.createElement('span');
        error.className = 'error-msg';
        error.textContent = mensaje;
        input.parentNode.appendChild(error);
    } else {
        input.nextElementSibling.textContent = mensaje;
    }
}
function limpiarError(input) {
    input.classList.remove('input-error');
    if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-msg')) {
        input.nextElementSibling.remove();
    }
}

// --- Renderizado de Ferias y Emprendimientos ---
function renderizarFerias() {
    const contenedor = document.getElementById('contenedor-ferias');
    contenedor.innerHTML = '';
    let ferias = leerFerias();
    ferias = ordenarFeriasPorFecha(ferias);
    if (ferias.length === 0) {
        contenedor.innerHTML = '<p>No hay ferias registradas.</p>';
        return;
    }
    ferias.forEach(feria => {
        const feriaDiv = document.createElement('div');
        feriaDiv.className = 'feria-card';
        feriaDiv.innerHTML = `
            <div class="feria-header">
                <h3>${feria.nombreLugar}</h3>
                <span class="feria-datos">${feria.fechaInicio} al ${feria.fechaFin} | ${feria.horarios}</span>
            </div>
            <div class="emprendimientos-list">
                <h4>Emprendimientos:</h4>
                ${feria.emprendimientos.length === 0 ? '<p>No hay emprendimientos registrados.</p>' : feria.emprendimientos.map(emp => renderizarEmprendimiento(emp)).join('')}
            </div>
        `;
        contenedor.appendChild(feriaDiv);
    });
}

function renderizarEmprendimiento(emp) {
    return `
    <div class="emprendimiento-card">
        <strong>${emp.nombre}</strong> <span>(${emp.categoria})</span><br>
        <span>${emp.descripcion}</span><br>
        ${emp.redSocial ? `<a href="${emp.redSocial}" target="_blank">Red social</a><br>` : ''}
        <div class="producto-card">
            ${emp.productos.map(prod => `
                <div>
                    <img src="${prod.foto}" alt="Foto producto">
                </div>
                <div>
                    <strong>${prod.nombre}</strong><br>
                    <span>Precio: $${parseFloat(prod.precio).toFixed(2)}</span><br>
                    <span>${prod.descripcion}</span>
                </div>
            `).join('')}
        </div>
    </div>
    `;
}

// --- Actualizar el select de ferias en el formulario de emprendimiento ---
function actualizarSelectFerias() {
    const select = document.getElementById('feria-asociada');
    const ferias = leerFerias();
    select.innerHTML = '';
    if (ferias.length === 0) {
        select.innerHTML = '<option value="">No hay ferias registradas</option>';
        select.disabled = true;
    } else {
        select.disabled = false;
        ferias.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = `${f.nombreLugar} (${f.fechaInicio})`;
            select.appendChild(opt);
        });
    }
}

// --- Validación de Feria ---
function validarFeria() {
    let valido = true;
    const nombreLugar = document.getElementById('lugar-feria');
    const fechaInicio = document.getElementById('fecha-inicio-feria');
    const fechaFin = document.getElementById('fecha-fin-feria');
    const horarios = document.getElementById('horarios-feria');
    limpiarError(nombreLugar);
    limpiarError(fechaInicio);
    limpiarError(fechaFin);
    limpiarError(horarios);
    if (nombreLugar.value.trim().length < 3) {
        mostrarError(nombreLugar, 'El nombre debe tener al menos 3 caracteres.');
        valido = false;
    }
    if (!fechaInicio.value) {
        mostrarError(fechaInicio, 'La fecha de inicio es obligatoria.');
        valido = false;
    }
    if (!fechaFin.value) {
        mostrarError(fechaFin, 'La fecha de finalización es obligatoria.');
        valido = false;
    }
    if (fechaInicio.value && fechaFin.value && new Date(fechaFin.value) < new Date(fechaInicio.value)) {
        mostrarError(fechaFin, 'La fecha de finalización no puede ser anterior a la de inicio.');
        valido = false;
    }
    // Validar fecha de inicio no en el pasado
    if (fechaInicio.value) {
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const inicio = new Date(fechaInicio.value);
        if (inicio < hoy) {
            mostrarError(fechaInicio, 'La fecha de inicio no puede ser anterior a hoy.');
            valido = false;
        }
    }
    if (!esHorarioValido(horarios.value)) {
        mostrarError(horarios, 'Formato de horario inválido. Ej: 8:00am - 5:00pm');
        valido = false;
    }
    return valido;
}

// --- Validación de Emprendimiento ---
function validarEmprendimiento() {
    let valido = true;
    const feriaId = document.getElementById('feria-asociada');
    const nombre = document.getElementById('nombre-emprendimiento');
    const categoria = document.getElementById('categoria-emprendimiento');
    const descripcion = document.getElementById('descripcion-emprendimiento');
    const redSocial = document.getElementById('red-social-emprendimiento');
    const nombreProd = document.getElementById('nombre-producto');
    const precioProd = document.getElementById('precio-producto');
    const descripcionProd = document.getElementById('descripcion-producto');
    const fotoInput = document.getElementById('foto-producto');
    limpiarError(nombre);
    limpiarError(categoria);
    limpiarError(descripcion);
    limpiarError(redSocial);
    limpiarError(nombreProd);
    limpiarError(precioProd);
    limpiarError(descripcionProd);
    limpiarError(fotoInput);
    if (!feriaId.value) {
        valido = false;
    }
    if (nombre.value.trim().length < 3) {
        mostrarError(nombre, 'El nombre debe tener al menos 3 caracteres.');
        valido = false;
    }
    if (categoria.value.trim().length < 3) {
        mostrarError(categoria, 'La categoría debe tener al menos 3 caracteres.');
        valido = false;
    }
    if (descripcion.value.trim().length < 10) {
        mostrarError(descripcion, 'La descripción debe tener al menos 10 caracteres.');
        valido = false;
    }
    if (redSocial.value && !esURLValida(redSocial.value)) {
        mostrarError(redSocial, 'El enlace debe ser una URL válida.');
        valido = false;
    }
    if (nombreProd.value.trim().length < 3) {
        mostrarError(nombreProd, 'El nombre del producto debe tener al menos 3 caracteres.');
        valido = false;
    }
    if (!precioProd.value || parseFloat(precioProd.value) <= 0) {
        mostrarError(precioProd, 'El precio debe ser mayor a 0.');
        valido = false;
    }
    if (descripcionProd.value.trim().length < 10) {
        mostrarError(descripcionProd, 'La descripción del producto debe tener al menos 10 caracteres.');
        valido = false;
    }
    if (!fotoInput.files[0]) {
        mostrarError(fotoInput, 'Debes seleccionar una imagen.');
        valido = false;
    } else {
        const file = fotoInput.files[0];
        if (!file.type.startsWith('image/')) {
            mostrarError(fotoInput, 'El archivo debe ser una imagen.');
            valido = false;
        } else if (file.size > 2 * 1024 * 1024) {
            mostrarError(fotoInput, 'La imagen no debe superar los 2MB.');
            valido = false;
        }
    }
    return valido;
}

// --- Registro de Feria ---
document.getElementById('form-feria').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validarFeria()) return;
    const nombreLugar = document.getElementById('lugar-feria').value.trim();
    const fechaInicio = document.getElementById('fecha-inicio-feria').value;
    const fechaFin = document.getElementById('fecha-fin-feria').value;
    const horarios = document.getElementById('horarios-feria').value.trim();
    const ferias = leerFerias();
    ferias.push({
        id: generarId(),
        nombreLugar,
        fechaInicio,
        fechaFin,
        horarios,
        emprendimientos: []
    });
    guardarFerias(ferias);
    this.reset();
    actualizarSelectFerias();
    renderizarFerias();
});

// --- Registro de Emprendimiento ---
document.getElementById('form-emprendimiento').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validarEmprendimiento()) return;
    const feriaId = document.getElementById('feria-asociada').value;
    const nombre = document.getElementById('nombre-emprendimiento').value.trim();
    const categoria = document.getElementById('categoria-emprendimiento').value.trim();
    const descripcion = document.getElementById('descripcion-emprendimiento').value.trim();
    const redSocial = document.getElementById('red-social-emprendimiento').value.trim();
    const nombreProd = document.getElementById('nombre-producto').value.trim();
    const precioProd = document.getElementById('precio-producto').value;
    const descripcionProd = document.getElementById('descripcion-producto').value.trim();
    const fotoInput = document.getElementById('foto-producto');
    // Leer la imagen como base64
    const reader = new FileReader();
    reader.onload = function(ev) {
        const fotoBase64 = ev.target.result;
        const ferias = leerFerias();
        const feria = ferias.find(f => f.id === feriaId);
        if (!feria) {
            alert('Feria no encontrada.');
            return;
        }
        const emprendimiento = {
            id: generarId(),
            nombre,
            categoria,
            descripcion,
            redSocial,
            productos: [{
                nombre: nombreProd,
                precio: precioProd,
                descripcion: descripcionProd,
                foto: fotoBase64
            }]
        };
        feria.emprendimientos.push(emprendimiento);
        guardarFerias(ferias);
        document.getElementById('form-emprendimiento').reset();
        renderizarFerias();
    };
    reader.readAsDataURL(fotoInput.files[0]);
});

// Validaciones en tiempo real para feedback inmediato
['lugar-feria','fecha-inicio-feria','fecha-fin-feria','horarios-feria'].forEach(id => {
    document.getElementById(id).addEventListener('input', validarFeria);
});
['nombre-emprendimiento','categoria-emprendimiento','descripcion-emprendimiento','red-social-emprendimiento','nombre-producto','precio-producto','descripcion-producto','foto-producto'].forEach(id => {
    document.getElementById(id).addEventListener('input', validarEmprendimiento);
    if(id==='foto-producto'){
        document.getElementById(id).addEventListener('change', validarEmprendimiento);
    }
});

//validacion para el formulario de registro de feria no permitir fechas pasadas y que la fecha de inicio sea posterior a la fecha actual
// (ya está cubierta en validarFeria, pero se mantiene para feedback inmediato)
document.getElementById('fecha-inicio-feria').addEventListener('change', function() {
    const fechaInicio = new Date(this.value);
    const fechaActual = new Date();
    fechaActual.setHours(0,0,0,0);
    if (fechaInicio < fechaActual) {
        alert('La fecha de inicio de la feria no puede ser anterior a la fecha actual.');
        this.value = '';
    }
});

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', function() {
    actualizarSelectFerias();
    renderizarFerias();
});


