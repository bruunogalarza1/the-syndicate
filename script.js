const faceCanvas = document.getElementById("faceCanvas");
const ctx = faceCanvas.getContext("2d");

const digitalCanvas = document.getElementById("digitalCanvas");
const digitalCtx = digitalCanvas.getContext("2d");

const faceContainer = document.querySelector(".face-container");
const loader = document.getElementById("loader");

let mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};

let smoothMouse = {
    x: mouse.x,
    y: mouse.y
};

let blink = 0;
let blinkTimer = 0;
let glitchTimer = 0;
let time = 0;


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const FACE_W = 430;
const FACE_H = 520;

faceCanvas.width = FACE_W;
faceCanvas.height = FACE_H;

digitalCanvas.width = window.innerWidth;
digitalCanvas.height = window.innerHeight;


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener("resize", () => {

    digitalCanvas.width = window.innerWidth;
    digitalCanvas.height = window.innerHeight;

});


/* =====================================================
   MOUSE
===================================================== */

window.addEventListener("mousemove", (event) => {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

});


/* =====================================================
   PARTÍCULAS
===================================================== */

const particles = [];

for (let i = 0; i < 110; i++) {

    particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.4,
        speed: Math.random() * 0.18 + 0.03,
        opacity: Math.random() * 0.45
    });

}


function drawParticles() {

    digitalCtx.clearRect(
        0,
        0,
        digitalCanvas.width,
        digitalCanvas.height
    );

    for (const p of particles) {

        p.y -= p.speed;

        if (p.y < 0) {
            p.y = digitalCanvas.height;
            p.x = Math.random() * digitalCanvas.width;
        }

        digitalCtx.beginPath();

        digitalCtx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        digitalCtx.fillStyle =
            `rgba(150,160,255,${p.opacity})`;

        digitalCtx.fill();

    }

}


/* =====================================================
   FUNCIONES AUXILIARES
===================================================== */

function lerp(a, b, amount) {
    return a + (b - a) * amount;
}


function glowCircle(x, y, radius, color) {

    const gradient =
        ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            radius
        );

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =====================================================
   ROSTRO
===================================================== */

function drawFace() {

    ctx.clearRect(
        0,
        0,
        FACE_W,
        FACE_H
    );

    time += 0.016;


    const cx = FACE_W / 2;
    const cy = 255;


    /* -----------------------------------------------
       MOVIMIENTO NATURAL DEL ROSTRO
    ----------------------------------------------- */

    const breathing =
        Math.sin(time * 1.1) * 2;

    const faceWidth =
        133 + breathing;

    const faceHeight =
        180 + breathing;


    /* -----------------------------------------------
       AURA
    ----------------------------------------------- */

    glowCircle(
        cx,
        cy,
        230,
        "rgba(100,110,255,0.055)"
    );

    glowCircle(
        cx,
        cy - 10,
        150,
        "rgba(130,130,255,0.035)"
    );


    /* -----------------------------------------------
       SOMBRA PRINCIPAL DEL ROSTRO
    ----------------------------------------------- */

    const faceGradient =
        ctx.createRadialGradient(
            cx - 35,
            cy - 55,
            20,
            cx,
            cy,
            200
        );

    faceGradient.addColorStop(
        0,
        "rgba(80,82,105,0.38)"
    );

    faceGradient.addColorStop(
        0.38,
        "rgba(35,36,48,0.58)"
    );

    faceGradient.addColorStop(
        0.72,
        "rgba(10,10,16,0.9)"
    );

    faceGradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.beginPath();

    ctx.ellipse(
        cx,
        cy,
        faceWidth,
        faceHeight,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        faceGradient;

    ctx.fill();


    /* -----------------------------------------------
       CONTORNO DIGITAL
    ----------------------------------------------- */

    ctx.strokeStyle =
        "rgba(155,160,210,0.10)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.ellipse(
        cx,
        cy,
        faceWidth,
        faceHeight,
        0,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    /* -----------------------------------------------
       LÍNEAS DE ESCANEO SOBRE EL ROSTRO
    ----------------------------------------------- */

    for (let y = 105; y < 420; y += 9) {

        ctx.strokeStyle =
            `rgba(150,160,255,${0.012 + Math.random() * 0.012})`;

        ctx.beginPath();

        ctx.moveTo(
            cx - faceWidth * 0.72,
            y
        );

        ctx.lineTo(
            cx + faceWidth * 0.72,
            y
        );

        ctx.stroke();

    }


    /* -----------------------------------------------
       CEJAS
    ----------------------------------------------- */

    const eyeY = 238;

    const eyebrowGlow =
        "rgba(150,155,210,0.16)";

    ctx.strokeStyle = eyebrowGlow;

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(130, eyeY - 27);

    ctx.quadraticCurveTo(
        160,
        eyeY - 42,
        190,
        eyeY - 25
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(240, eyeY - 25);

    ctx.quadraticCurveTo(
        270,
        eyeY - 42,
        300,
        eyeY - 27
    );

    ctx.stroke();


    /* -----------------------------------------------
       OJOS
    ----------------------------------------------- */

    const lookX =
        (smoothMouse.x - window.innerWidth / 2)
        / 30;

    const lookY =
        (smoothMouse.y - window.innerHeight / 2)
        / 40;


    const leftEyeX = 160 + lookX;
    const rightEyeX = 270 + lookX;

    const eyeLookY =
        eyeY + lookY;


    drawEye(
        leftEyeX,
        eyeLookY
    );

    drawEye(
        rightEyeX,
        eyeLookY
    );


    /* -----------------------------------------------
       PÓMULOS
    ----------------------------------------------- */

    ctx.strokeStyle =
        "rgba(150,155,200,0.08)";

    ctx.lineWidth = 2;


    ctx.beginPath();

    ctx.moveTo(105, 270);

    ctx.quadraticCurveTo(
        140,
        300,
        185,
        285
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(245, 285);

    ctx.quadraticCurveTo(
        290,
        300,
        325,
        270
    );

    ctx.stroke();


    /* -----------------------------------------------
       NARIZ
    ----------------------------------------------- */

    ctx.strokeStyle =
        "rgba(170,175,220,0.11)";

    ctx.lineWidth = 1.5;


    ctx.beginPath();

    ctx.moveTo(cx, 245);

    ctx.quadraticCurveTo(
        cx - 4,
        285,
        cx - 11,
        310
    );

    ctx.quadraticCurveTo(
        cx - 4,
        318,
        cx,
        318
    );

    ctx.quadraticCurveTo(
        cx + 8,
        318,
        cx + 12,
        310
    );

    ctx.stroke();


    /* -----------------------------------------------
       BOCA
    ----------------------------------------------- */

    ctx.strokeStyle =
        "rgba(170,175,220,0.13)";

    ctx.lineWidth = 1.3;


    ctx.beginPath();

    ctx.moveTo(178, 354);

    ctx.quadraticCurveTo(
        cx,
        363,
        252,
        354
    );

    ctx.stroke();


    /* -----------------------------------------------
       MANDÍBULA
    ----------------------------------------------- */

    ctx.strokeStyle =
        "rgba(145,150,190,0.07)";

    ctx.beginPath();

    ctx.moveTo(125, 330);

    ctx.quadraticCurveTo(
        cx,
        410,
        305,
        330
    );

    ctx.stroke();


    /* -----------------------------------------------
       CIRCUITOS
    ----------------------------------------------- */

    drawCircuit(
        110,
        180,
        145,
        165
    );

    drawCircuit(
        320,
        190,
        285,
        165
    );

    drawCircuit(
        125,
        330,
        150,
        350
    );

    drawCircuit(
        305,
        330,
        280,
        350
    );


    /* -----------------------------------------------
       GLITCH
    ----------------------------------------------- */

    if (Math.random() > 0.992) {

        drawGlitch();

    }


    /* -----------------------------------------------
       PARPADEO
    ----------------------------------------------- */

    if (blink > 0) {

        ctx.fillStyle =
            `rgba(3,3,6,${blink})`;

        ctx.fillRect(
            105,
            220,
            220,
            45
        );

        blink -= 0.12;

    }

}


/* =====================================================
   OJOS
===================================================== */

function drawEye(x, y) {

    const eyeWidth = 34;
    const eyeHeight = 9;


    /* Aura */

    glowCircle(
        x,
        y,
        48,
        "rgba(120,130,255,0.12)"
    );


    /* Párpado */

    ctx.strokeStyle =
        "rgba(190,195,230,0.22)";

    ctx.lineWidth = 1.2;

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        eyeWidth,
        eyeHeight,
        0,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    /* Iris */

    const iris =
        ctx.createRadialGradient(
            x,
            y,
            1,
            x,
            y,
            15
        );

    iris.addColorStop(
        0,
        "rgba(245,245,255,1)"
    );

    iris.addColorStop(
        .2,
        "rgba(180,185,255,1)"
    );

    iris.addColorStop(
        .55,
        "rgba(100,110,255,.8)"
    );

    iris.addColorStop(
        1,
        "rgba(50,50,130,0)"
    );


    ctx.fillStyle = iris;

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        eyeWidth,
        eyeHeight,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Pupila */

    ctx.fillStyle =
        "rgba(255,255,255,.95)";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Reflejo */

    ctx.fillStyle =
        "rgba(255,255,255,.8)";

    ctx.beginPath();

    ctx.arc(
        x - 5,
        y - 2,
        1,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =====================================================
   CIRCUITOS
===================================================== */

function drawCircuit(
    startX,
    startY,
    endX,
    endY
) {

    ctx.strokeStyle =
        "rgba(120,130,210,0.10)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        startX,
        startY
    );

    ctx.lineTo(
        endX,
        startY
    );

    ctx.lineTo(
        endX,
        endY
    );

    ctx.stroke();


    ctx.fillStyle =
        "rgba(150,160,255,0.28)";

    ctx.beginPath();

    ctx.arc(
        endX,
        endY,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =====================================================
   GLITCH
===================================================== */

function drawGlitch() {

    for (let i = 0; i < 5; i++) {

        const y =
            140 + Math.random() * 220;

        const width =
            20 + Math.random() * 100;

        const x =
            100 + Math.random() * 200;


        ctx.fillStyle =
            `rgba(
                ${100 + Math.random() * 100},
                ${100 + Math.random() * 100},
                255,
                .08
            )`;


        ctx.fillRect(
            x,
            y,
            width,
            1 + Math.random() * 3
        );

    }

}


/* =====================================================
   PARPADEO ALEATORIO
===================================================== */

setInterval(() => {

    if (Math.random() > 0.45) {

        blink = 1;

    }

}, 4200);


/* =====================================================
   ANIMACIÓN PRINCIPAL
===================================================== */

function animate() {

    smoothMouse.x = lerp(
        smoothMouse.x,
        mouse.x,
        0.07
    );

    smoothMouse.y = lerp(
        smoothMouse.y,
        mouse.y,
        0.07
    );


    const movementX =
        (smoothMouse.x -
            window.innerWidth / 2) * 0.010;


    const movementY =
        (smoothMouse.y -
            window.innerHeight / 2) * 0.006;


    faceContainer.style.transform =
        `translate(
            calc(-50% + ${movementX}px),
            calc(-50% + ${movementY}px)
        )`;


    drawFace();

    drawParticles();

    requestAnimationFrame(
        animate
    );

}


/* =====================================================
   BOTÓN
===================================================== */

const enterButton =
    document.getElementById(
        "enterButton"
    );

enterButton.addEventListener(
    "click",
    () => {

        document.querySelector(
            ".story"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }
);


/* =====================================================
   CONTADOR
===================================================== */

const currentMembers = 0;

const memberCount =
    document.getElementById(
        "memberCount"
    );

const progressBar =
    document.getElementById(
        "progressBar"
    );


memberCount.textContent =
    currentMembers;


progressBar.style.width =
    `${(currentMembers / 500) * 100}%`;


/* =====================================================
   CARGA
===================================================== */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            loader.classList.add(
                "hidden"
            );

        }, 1300);

    }
);


/* =====================================================
   INICIAR
===================================================== */

animate();
