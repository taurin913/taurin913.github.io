document.addEventListener('DOMContentLoaded', function() {
    const examenesContainer = document.getElementById('examenes');
    const trabajosContainer = document.getElementById('trabajos');
    const normalesContainer = document.getElementById('normales');

    const mensajesContainer = {
        examen: examenesContainer,
        trabajo: trabajosContainer,
        normal: normalesContainer
    };

    // Cargar mensajes desde localStorage
    const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];
    mensajesGuardados.forEach(mensaje => {
        agregarMensajePorMes(mensaje);
    });

    // Evento para enviar mensaje
    document.getElementById('mensajeForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const mensaje = document.getElementById('mensaje').value;
        const tipo = document.getElementById('tipoMensaje').value;

        // Obtener fecha y hora actuales
        const fechaHora = new Date().toLocaleString();

        // Guardar mensaje en localStorage
        const mensajeData = { nombre, mensaje, fecha: fechaHora, tipo };
        mensajesGuardados.push(mensajeData);
        localStorage.setItem('mensajes', JSON.stringify(mensajesGuardados));

        // Crear el mensaje y añadir al contenedor correspondiente
        agregarMensajePorMes(mensajeData);

        // Resetear el formulario
        document.getElementById('mensajeForm').reset();
    });

    // Función para agregar mensaje agrupado por mes
    function agregarMensajePorMes(mensajeData) {
        const { nombre, mensaje, fecha, tipo } = mensajeData;

        // Obtener el mes y el año
        const fechaObj = new Date(fecha);
        const mesAnio = fechaObj.toLocaleString('default', { month: 'long', year: 'numeric' });

        // Crear o seleccionar la sección del mes correspondiente
        let mesContainer = document.querySelector(`#${tipo} .mes-${mesAnio}`);
        if (!mesContainer) {
            mesContainer = document.createElement('div');
            mesContainer.classList.add(`mes-${mesAnio}`);
            mesContainer.innerHTML = `<h3>${mesAnio}</h3>`;
            mensajesContainer[tipo].appendChild(mesContainer);
        }

        // Crear el mensaje y añadir al contenedor del mes correspondiente
        const nuevoMensaje = crearElementoMensaje(nombre, mensaje, fecha);
        mesContainer.appendChild(nuevoMensaje);
    }

    // Función para crear un mensaje
    function crearElementoMensaje(nombre, mensaje, fecha) {
        const nuevoMensaje = document.createElement('div');
        nuevoMensaje.classList.add('mensaje');

        nuevoMensaje.innerHTML = `
            <strong>${nombre}</strong>: ${mensaje} <em>(${fecha})</em>
            <button class="eliminar-mensaje" style="margin-left: 10px;">Eliminar</button>
        `;

        // Agregar evento para eliminar mensaje
        nuevoMensaje.querySelector('.eliminar-mensaje').addEventListener('click', function() {
            eliminarMensaje(nuevoMensaje, nombre, mensaje, fecha);
        });

        return nuevoMensaje;
    }

    // Función para eliminar un mensaje
    function eliminarMensaje(elementoMensaje, nombre, mensaje, fecha) {
        // Eliminar el mensaje del DOM
        elementoMensaje.remove();

        // Eliminar mensaje del localStorage
        const mensajesGuardados = JSON.parse(localStorage.getItem('mensajes')) || [];
        const mensajesActualizados = mensajesGuardados.filter(m =>
            !(m.nombre === nombre && m.mensaje === mensaje && m.fecha === fecha)
        );

        localStorage.setItem('mensajes', JSON.stringify(mensajesActualizados));
    }
});

// 7. Calendario - Configuración de FullCalendar
document.addEventListener('DOMContentLoaded', function() {
    const calendarioEl = document.getElementById('calendario');

    const calendar = new FullCalendar.Calendar(calendarioEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true,
        select: function(info) {
            const nombre = prompt('Nombre de la actividad:');
            const tipo = prompt('Tipo de actividad (examen/trabajo):').toLowerCase();
            if (nombre && tipo) {
                const evento = {
                    title: `${nombre} (${tipo})`,
                    start: info.startStr,
                    end: info.endStr,
                    allDay: true,
                    classNames: tipo === 'examen' ? 'evento-examen' : 'evento-trabajo'
                };
                calendar.addEvent(evento);
                guardarEvento(evento);
            }
            calendar.unselect();
        },
        events: cargarEventos(),
        eventDidMount: function(info) {
            // Crear botón de eliminar para eventos
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

    // 8. Función para guardar eventos en localStorage
    function guardarEvento(evento) {
        const eventosGuardados = JSON.parse(localStorage.getItem('eventos')) || [];
        eventosGuardados.push(evento);
        localStorage.setItem('eventos', JSON.stringify(eventosGuardados));
    }

    // 9. Función para eliminar eventos de localStorage
    function eliminarEvento(evento) {
        let eventosGuardados = JSON.parse(localStorage.getItem('eventos')) || [];
        eventosGuardados = eventosGuardados.filter(e => e.title !== evento.title || e.start !== evento.startStr);
        localStorage.setItem('eventos', JSON.stringify(eventosGuardados));
    }

    // 10. Función para cargar eventos desde localStorage al calendario
    function cargarEventos() {
        return JSON.parse(localStorage.getItem('eventos')) || [];
    }
});


//jueguito de la serpiente
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const boxSize = 20;
let snake = [{ x: boxSize * 5, y: boxSize * 5 }];
let direction = "RIGHT";
let food = spawnFood();
let score = 0;

let lastUpdateTime = 0;
const movementInterval = 100; // Intervalo de movimiento de la serpiente (en milisegundos)
let lastMoveTime = 0; // Tiempo del último movimiento

const targetFps = 60; // Queremos actualizar a 60 FPS (o más)
const frameTime = 1000 / targetFps; // Tiempo en milisegundos entre cuadros para 60 FPS

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const key = event.keyCode;

    // Control con las flechas
    if (key === 37 && direction !== "RIGHT") direction = "LEFT";  // Flecha izquierda
    else if (key === 38 && direction !== "DOWN") direction = "UP"; // Flecha arriba
    else if (key === 39 && direction !== "LEFT") direction = "RIGHT"; // Flecha derecha
    else if (key === 40 && direction !== "UP") direction = "DOWN"; // Flecha abajo

    // Control con WASD
    else if (key === 65 && direction !== "RIGHT") direction = "LEFT"; // A
    else if (key === 87 && direction !== "DOWN") direction = "UP";    // W
    else if (key === 68 && direction !== "LEFT") direction = "RIGHT"; // D
    else if (key === 83 && direction !== "UP") direction = "DOWN";   // S
}

function spawnFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
        y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize,
    };
}

function drawGame(timestamp) {
    // Calcula el tiempo desde la última actualización
    const deltaTime = timestamp - lastUpdateTime;

    // Si pasó suficiente tiempo, actualiza el lienzo (esto aumenta el FPS sin acelerar la serpiente)
    if (deltaTime >= frameTime) {
        lastUpdateTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibuja la serpiente
        snake.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? "#572364" : "#42214b";
            ctx.fillRect(part.x, part.y, boxSize, boxSize);
        });

        // Dibuja la comida
        ctx.fillStyle = "#a8dc9b";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);
    }

    // Mueve la serpiente solo si ha pasado el tiempo suficiente (sin afectar la tasa de FPS)
    if (timestamp - lastMoveTime >= movementInterval) {
        moveSnake();
        lastMoveTime = timestamp;
    }

    requestAnimationFrame(drawGame); // Solicita el siguiente cuadro
}

function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    if (direction === "LEFT") head.x -= boxSize;
    if (direction === "UP") head.y -= boxSize;
    if (direction === "RIGHT") head.x += boxSize;
    if (direction === "DOWN") head.y += boxSize;

    // Si la serpiente come la comida
    if (head.x === food.x && head.y === food.y) {
        food = spawnFood();
        score++;
    } else {
        snake.pop(); // Elimina la última parte de la serpiente si no come
    }

    snake.unshift(head); // Agrega la nueva cabeza al inicio de la serpiente

    // Verifica colisiones
    if (
        head.x < 0 || head.x >= canvas.width || 
        head.y < 0 || head.y >= canvas.height || 
        snakeCollision(head)
    ) {
        alert(`Game Over! Puntuación: ${score}`);
        resetGame();
    }
}

function snakeCollision(head) {
    return snake.some((part, index) => index !== 0 && part.x === head.x && part.y === head.y);
}

function resetGame() {
    snake = [{ x: boxSize * 5, y: boxSize * 5 }];
    direction = "RIGHT";
    food = spawnFood();
    score = 0;
}

requestAnimationFrame(drawGame); // Inicia el juego
