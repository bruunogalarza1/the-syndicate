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


/* =========================
   TAMAÑOS
========================= */

function resize() {

    faceCanvas.width = 430;
    faceCanvas.height = 520;

    digitalCanvas.width = window.innerWidth;
    digitalCanvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);


/* =========================
   MOUSE
========================= */

window.addEventListener("mousemove", (event) => {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

});


/* =========================
   PARTÍCULAS
========================= */

const particles = [];

for (let i = 0; i < 90; i++) {

    particles.push({

        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,

        size: Math.random() * 1.5,

        speed:
            Math.random() * 0.25 + 0.05,

        opacity:
            Math.random() * 0.5

    });

}


function drawParticles() {

    digitalCtx.clearRect(
        0,
        0,
        digitalCanvas.width,
        digitalCanvas.height
    );

    particles.forEach((particle) => {

        particle.y -= particle.speed;

        if (particle.y < 0) {

            particle.y =
                digitalCanvas.height;

        }

        digitalCtx.beginPath();

        digitalCtx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        digitalCtx.fillStyle =
            `rgba(170,170,255,${particle.opacity})`;

        digitalCtx.fill();

    });

}


/* =========================
   ROSTRO DIGITAL
========================= */

function drawFace() {

    ctx.clearRect(
        0,
        0,
        faceCanvas.width,
        faceCanvas.height
    );


    const centerX = 215;
    const centerY = 245;


    /* SOMBRA EXTERIOR */

    const glow =
        ctx.createRadialGradient(
            centerX,
            centerY,
            50,
            centerX,
            centerY,
            220
        );

    glow.addColorStop(
        0,
        "rgba(100,100,180,.10)"
    );

    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
        0,
        0,
        430,
        520
    );


    /* SILUETA */

    const face =
        ctx.createRadialGradient(
            centerX - 20,
            centerY - 30,
            20,
            centerX,
            centerY,
            190
        );

    face.addColorStop(
        0,
        "rgba(55,55,70,.42)"
    );

    face.addColorStop(
        .55,
        "rgba(12,12,18,.8)"
    );

    face.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.beginPath();

    ctx.ellipse(
        centerX,
        centerY,
        135,
        180,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = face;

    ctx.fill();


    /* LÍNEAS FACIALES */

    ctx.strokeStyle =
        "rgba(130,130,180,.10)";

    ctx.lineWidth = 1;


    // Frente

    ctx.beginPath();

    ctx.moveTo(170, 125);
    ctx.quadraticCurveTo(
        215,
        105,
        260,
        125
    );

    ctx.stroke();


    // Pómulos

    ctx.beginPath();

    ctx.moveTo(105, 245);
    ctx.quadraticCurveTo(
        145,
        215,
        180,
        240
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(250, 240);
    ctx.quadraticCurveTo(
        285,
        215,
        325,
        245
    );

    ctx.stroke();


    /* OJOS */

    const eyeOffsetX =
        (smoothMouse.x -
            window.innerWidth / 2) / 40;

    const eyeOffsetY =
        (smoothMouse.y -
            window.innerHeight / 2) / 40;


    drawEye(
        160 + eyeOffsetX,
        235 + eyeOffsetY
    );

    drawEye(
        270 + eyeOffsetX,
        235 + eyeOffsetY
    );


    /* NARIZ */

    ctx.strokeStyle =
        "rgba(150,150,180,.12)";

    ctx.beginPath();

    ctx.moveTo(centerX, 245);

    ctx.lineTo(
        centerX - 8,
        310
    );

    ctx.quadraticCurveTo(
        centerX,
        318,
        centerX + 10,
        310
    );

    ctx.stroke();


    /* BOCA */

    ctx.beginPath();

    ctx.moveTo(180, 350);

    ctx.quadraticCurveTo(
        215,
        362,
        250,
        350
    );

    ctx.stroke();


    /* MICRO GLITCH */

    if (Math.random() > 0.985) {

        ctx.fillStyle =
            "rgba(150,150,255,.08)";

        ctx.fillRect(
            100 + Math.random() * 180,
            130 + Math.random() * 250,
            80,
            2
        );

    }

}


/* =========================
   OJO
========================= */

function drawEye(x, y) {

    const gradient =
        ctx.createRadialGradient(
            x,
            y,
            1,
            x,
            y,
            35
        );

    gradient.addColorStop(
        0,
        "rgba(220,225,255,1)"
    );

    gradient.addColorStop(
        .15,
        "rgba(150,160,255,.9)"
    );

    gradient.addColorStop(
        1,
        "rgba(100,100,255,0)"
    );


    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        32,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* PUPILA */

    ctx.fillStyle =
        "rgba(240,240,255,.9)";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================
   ANIMACIÓN
========================= */

function animate() {

    smoothMouse.x +=
        (mouse.x - smoothMouse.x) * .08;

    smoothMouse.y +=
        (mouse.y - smoothMouse.y) * .08;


    const moveX =
        (smoothMouse.x -
            window.innerWidth / 2) * .008;

    const moveY =
        (smoothMouse.y -
            window.innerHeight / 2) * .005;


    faceContainer.style.transform =
        `translate(
            calc(-50% + ${moveX}px),
            calc(-50% + ${moveY}px)
        )`;


    drawFace();

    drawParticles();

    requestAnimationFrame(animate);

}


/* =========================
   BOTÓN
========================= */

const enterButton =
    document.getElementById("enterButton");

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


/* =========================
   CONTADOR
========================= */

const currentMembers = 0;

const memberCount =
    document.getElementById("memberCount");

const progressBar =
    document.getElementById("progressBar");


function updateCounter() {

    memberCount.textContent =
        currentMembers;

    progressBar.style.width =
        `${(currentMembers / 500) * 100}%`;

}

updateCounter();


/* =========================
   CARGA
========================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            loader.classList.add(
                "hidden"
            );

        }, 1200);

    }
);


/* =========================
   INICIAR
========================= */

animate();
