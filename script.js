document.addEventListener('DOMContentLoaded', function() {
    // Variables de contenedor para mensajes
    const examenesContainer = document.getElementById('examenes');
    const trabajosContainer = document.getElementById('trabajos');
    const normalesContainer = document.getElementById('normales');
    const mensajesContainer = { examen: examenesContainer, trabajo: trabajosContainer, normal: normalesContainer };

    // Cargar mensajes desde localStorage
    const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];
    mensajesGuardados.forEach(mensaje => agregarMensajePorMes(mensaje));

    // Formulario para enviar mensaje
    document.getElementById('mensajeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const mensaje = document.getElementById('mensaje').value;
        const tipo = document.getElementById('tipoMensaje').value;
        const fechaHora = new Date().toLocaleString();
        const mensajeData = { nombre, mensaje, fecha: fechaHora, tipo };
        mensajesGuardados.push(mensajeData);
        localStorage.setItem('mensajes', JSON.stringify(mensajesGuardados));
        agregarMensajePorMes(mensajeData);
        document.getElementById('mensajeForm').reset();
    });

    // Agregar mensajes agrupados por mes
    function agregarMensajePorMes(mensajeData) {
        const { nombre, mensaje, fecha, tipo } = mensajeData;
        const fechaObj = new Date(fecha);
        const mesAnio = fechaObj.toLocaleString('default', { month: 'long', year: 'numeric' }).replace(/\s+/g, '-');
        let mesContainer = document.querySelector(`#${tipo} .mes-${mesAnio}`);
        if (!mesContainer) {
            mesContainer = document.createElement('div');
            mesContainer.classList.add(`mes-${mesAnio}`);
            mesContainer.innerHTML = `<h3>${mesAnio}</h3>`;
            mensajesContainer[tipo].appendChild(mesContainer);
        }
        const nuevoMensaje = crearElementoMensaje(nombre, mensaje, fecha);
        mesContainer.appendChild(nuevoMensaje);
    }

    function crearElementoMensaje(nombre, mensaje, fecha) {
        const nuevoMensaje = document.createElement('div');
        nuevoMensaje.classList.add('mensaje');
        nuevoMensaje.innerHTML = `<strong>${nombre}</strong>: ${mensaje} <em>(${fecha})</em>
            <button class="eliminar-mensaje" style="margin-left: 10px;">Eliminar</button>`;
        nuevoMensaje.querySelector('.eliminar-mensaje').addEventListener('click', function() {
            eliminarMensaje(nuevoMensaje, nombre, mensaje, fecha);
        });
        return nuevoMensaje;
    }

    function eliminarMensaje(elementoMensaje, nombre, mensaje, fecha) {
        elementoMensaje.remove();
        const mensajesActualizados = mensajesGuardados.filter(m =>
            !(m.nombre === nombre && m.mensaje === mensaje && m.fecha === fecha)
        );
        localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));
    }

    // Configuración del calendario con FullCalendar
    const calendarioEl = document.getElementById('calendario');
    const calendar = new FullCalendar.Calendar(calendarioEl, {
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        selectable: true,
        select: function(info) {
            const nombre = prompt('Nombre de la actividad:');
            const tipo = prompt('Tipo de actividad (examen/trabajo):').toLowerCase();
            if (nombre && tipo) {
                const evento = { title: `${nombre} (${tipo})`, start: info.startStr, end: info.endStr, allDay: true, classNames: tipo === 'examen' ? 'evento-examen' : 'evento-trabajo' };
                calendar.addEvent(evento);
                guardarEvento(evento);
            }
            calendar.unselect();
        },
        events: cargarEventos(),
        eventDidMount: function(info) {
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = 'X';
            deleteBtn.classList.add('delete-event-btn');
            deleteBtn.onclick = function() {
                if (confirm(`¿Deseas eliminar el evento "${info.event.title}"?`)) {
                    info.event.remove();
                    eliminarEvento(info.event);
                }
            };
            info.el.appendChild(deleteBtn);
        }
    });
    calendar.render();

    function guardarEvento(evento) {
        const eventosGuardados = JSON.parse(localStorage.getItem('eventos')) || [];
        eventosGuardados.push(evento);
        localStorage.setItem('eventos', JSON.stringify(eventosGuardados));
    }

    function eliminarEvento(evento) {
        let eventosGuardados = JSON.parse(localStorage.getItem('eventos')) || [];
        eventosGuardados = eventosGuardados.filter(e => e.title !== evento.title || e.start !== evento.startStr);
        localStorage.setItem('eventos', JSON.stringify(eventosGuardados));
    }

    function cargarEventos() {
        return JSON.parse(localStorage.getItem('eventos')) || [];
    }

    // Juego de la serpiente
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const boxSize = 20;
    let snake = [{ x: boxSize * 5, y: boxSize * 5 }];
    let direction = "RIGHT";
    let food = spawnFood();
    let score = 0;
    let lastUpdateTime = 0;
    const movementInterval = 100;
    let lastMoveTime = 0;

    document.addEventListener("keydown", changeDirection);
    function changeDirection(event) {
        const key = event.keyCode;
        if (key === 37 && direction !== "RIGHT") direction = "LEFT";
        else if (key === 38 && direction !== "DOWN") direction = "UP";
        else if (key === 39 && direction !== "LEFT") direction = "RIGHT";
        else if (key === 40 && direction !== "UP") direction = "DOWN";
    }

    function spawnFood() {
        return {
            x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
            y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
        };
    }

    function gameLoop(timestamp) {
        if (timestamp - lastUpdateTime >= movementInterval) {
            lastUpdateTime = timestamp;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            snake.forEach(segment => ctx.fillRect(segment.x, segment.y, boxSize, boxSize));
            ctx.fillStyle = "red";
            ctx.fillRect(food.x, food.y, boxSize, boxSize);
            let head = { x: snake[0].x, y: snake[0].y };
            if (direction === "LEFT") head.x -= boxSize;
            else if (direction === "UP") head.y -= boxSize;
            else if (direction === "RIGHT") head.x += boxSize;
            else if (direction === "DOWN") head.y += boxSize;
            if (head.x === food.x && head.y === food.y) {
                score += 1;
                food = spawnFood();
            } else {
                snake.pop();
            }
            snake.unshift(head);
            if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
                alert("Game Over!");
                snake = [{ x: boxSize * 5, y: boxSize * 5 }];
                direction = "RIGHT";
                score = 0;
                food = spawnFood();
            }
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
});
