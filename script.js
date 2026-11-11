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

const CX = FACE_W / 2;
const CY = 255;


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


/* =====================================================
   GRÁFICO DE TRADING DE FONDO (sutil, tendencia alcista)
===================================================== */

const CHART_VISIBLE = 64;
const CHART_INTERVAL = 1400;

const chart = {
    candles: [],
    price: 100,
    last: performance.now(),
    min: 0,
    max: 0
};

function nextCandle() {

    const o = chart.price;
    const move = 0.0014 + (Math.random() - 0.46) * 0.012;
    const c = o * (1 + move);

    chart.candles.push({
        o: o,
        c: c,
        h: Math.max(o, c) * (1 + Math.random() * 0.003),
        l: Math.min(o, c) * (1 - Math.random() * 0.003)
    });

    chart.price = c;

    if (chart.candles.length > CHART_VISIBLE + 3) {
        chart.candles.shift();
    }

}

for (let i = 0; i < CHART_VISIBLE + 2; i++) nextCandle();

chart.min = Math.min(...chart.candles.map(c => c.l));
chart.max = Math.max(...chart.candles.map(c => c.h));


function drawChart() {

    const W = digitalCanvas.width;
    const H = digitalCanvas.height;
    const g = digitalCtx;

    const now = performance.now();

    if (now - chart.last >= CHART_INTERVAL) {
        nextCandle();
        chart.last = now;
    }

    const progress = Math.min(1, (now - chart.last) / CHART_INTERVAL);

    const n = chart.candles.length;
    const step = W / CHART_VISIBLE;
    const right = W * 0.96;

    // Autoescala suave
    let mn = Infinity;
    let mx = -Infinity;

    for (const c of chart.candles) {
        if (c.l < mn) mn = c.l;
        if (c.h > mx) mx = c.h;
    }

    const pad = (mx - mn) * 0.08;

    chart.min = lerp(chart.min, mn - pad, 0.04);
    chart.max = lerp(chart.max, mx + pad, 0.04);

    const top = H * 0.30;
    const bottom = H * 0.94;

    const yOf = (p) =>
        top + (1 - (p - chart.min) / (chart.max - chart.min)) * (bottom - top);

    const xOf = (i) =>
        right - (n - 1 - i) * step + (1 - progress) * step;

    const fade = (x) =>
        Math.pow(clamp(x / (W * 0.40), 0, 1), 1.6);


    /* Líneas de precio (cuadrícula) */

    g.lineWidth = 1;

    for (let k = 0; k < 5; k++) {

        const y = top + ((bottom - top) * k) / 4;

        g.strokeStyle = "rgba(150,160,255,0.035)";
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();

    }


    /* Velas */

    const bodyW = Math.max(2, step * 0.46);

    for (let i = 0; i < n; i++) {

        const c = chart.candles[i];
        const x = xOf(i);

        if (x < -step || x > W + step) continue;

        const a = fade(x);

        const yO = yOf(c.o);
        const yC = yOf(c.c);

        g.strokeStyle = `rgba(150,160,255,${(0.10 * a).toFixed(3)})`;
        g.lineWidth = 1;

        g.beginPath();
        g.moveTo(x, yOf(c.h));
        g.lineTo(x, yOf(c.l));
        g.stroke();

        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(1.5, Math.abs(yC - yO));

        if (c.c >= c.o) {
            g.fillStyle = `rgba(150,160,255,${(0.14 * a).toFixed(3)})`;
            g.fillRect(x - bodyW / 2, bodyTop, bodyW, bodyH);
        } else {
            g.strokeStyle = `rgba(150,160,255,${(0.14 * a).toFixed(3)})`;
            g.strokeRect(x - bodyW / 2, bodyTop, bodyW, bodyH);
        }

    }


    /* Línea de cierres + área */

    const lineGrad = g.createLinearGradient(0, 0, W, 0);
    lineGrad.addColorStop(0, "rgba(150,160,255,0)");
    lineGrad.addColorStop(0.45, "rgba(150,160,255,0.16)");
    lineGrad.addColorStop(1, "rgba(170,180,255,0.26)");

    const areaGrad = g.createLinearGradient(0, 0, W, 0);
    areaGrad.addColorStop(0, "rgba(120,130,255,0)");
    areaGrad.addColorStop(1, "rgba(120,130,255,0.045)");

    g.beginPath();

    for (let i = 0; i < n; i++) {

        const x = xOf(i);
        const y = yOf(chart.candles[i].c);

        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);

    }

    g.strokeStyle = lineGrad;
    g.lineWidth = 1.3;
    g.lineJoin = "round";
    g.stroke();

    g.lineTo(xOf(n - 1), bottom);
    g.lineTo(xOf(0), bottom);
    g.closePath();
    g.fillStyle = areaGrad;
    g.fill();


    /* Punto del precio actual */

    const lastX = xOf(n - 1);
    const lastY = yOf(chart.candles[n - 1].c);

    g.strokeStyle = "rgba(170,180,255,0.07)";
    g.setLineDash([3, 7]);
    g.beginPath();
    g.moveTo(0, lastY);
    g.lineTo(W, lastY);
    g.stroke();
    g.setLineDash([]);

    const pulse = 0.5 + 0.5 * Math.sin(time * 3);

    const glow = g.createRadialGradient(lastX, lastY, 0, lastX, lastY, 14);
    glow.addColorStop(0, `rgba(170,180,255,${(0.25 + pulse * 0.15).toFixed(3)})`);
    glow.addColorStop(1, "rgba(170,180,255,0)");

    g.fillStyle = glow;
    g.beginPath();
    g.arc(lastX, lastY, 14, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = "rgba(210,215,255,0.6)";
    g.beginPath();
    g.arc(lastX, lastY, 2, 0, Math.PI * 2);
    g.fill();

}


function drawParticles() {

    digitalCtx.clearRect(
        0,
        0,
        digitalCanvas.width,
        digitalCanvas.height
    );

    drawChart();

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

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
}

function glowCircle(x, y, radius, color) {

    const gradient =
        ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

}


/* =====================================================
   MODELO 3D DEL ROSTRO
   Superficie paramétrica (t = altura, th = ángulo)
   con relieves: cejas, ojos, nariz, labios, mentón...
===================================================== */

const HEAD_A = 118;   // ancho
const HEAD_B = 160;   // alto
const HEAD_C = 100;   // profundidad

function gauss(t, t0, st, th, th0, sth) {
    return Math.exp(
        -(
            ((t - t0) * (t - t0)) / (2 * st * st) +
            ((th - th0) * (th - th0)) / (2 * sth * sth)
        )
    );
}

function surf(t, th) {

    // Cráneo más "cuadrado" y humano (superelipse)
    const r = Math.pow(Math.max(0, 1 - t * t), 0.42);

    // Mandíbula
    const jaw = smoothstep(0.15, 1, t);
    const w = 1 - 0.30 * jaw;
    const dpt = 1 - 0.10 * jaw;

    let d = 0;

    // Frente y arco de las cejas
    d += gauss(t, -0.26, 0.07, th, 0, 0.9) * 9;
    d += gauss(t, -0.55, 0.15, th, 0, 0.7) * 4;

    // Cuencas de los ojos (más profundas)
    d -= gauss(t, -0.10, 0.07, th, 0.5, 0.17) * 12;
    d -= gauss(t, -0.10, 0.07, th, -0.5, 0.17) * 12;

    // Pómulos
    d += gauss(t, 0.14, 0.10, th, 0.65, 0.20) * 9;
    d += gauss(t, 0.14, 0.10, th, -0.65, 0.20) * 9;

    // Nariz: puente, punta y aletas
    d += gauss(t, 0.08, 0.17, th, 0, 0.07) * 16;
    d += gauss(t, 0.27, 0.05, th, 0, 0.09) * 20;
    d += gauss(t, 0.29, 0.04, th, 0.14, 0.07) * 10;
    d += gauss(t, 0.29, 0.04, th, -0.14, 0.07) * 10;

    // Labios (más llenos) y comisuras
    d += gauss(t, 0.50, 0.035, th, 0, 0.28) * 8;
    d -= gauss(t, 0.555, 0.014, th, 0, 0.30) * 6;
    d += gauss(t, 0.62, 0.04, th, 0, 0.26) * 7;

    // Mentón y ángulo de la mandíbula
    d += gauss(t, 0.80, 0.09, th, 0, 0.35) * 12;
    d += gauss(t, 0.60, 0.12, th, 0.95, 0.20) * 6;
    d += gauss(t, 0.60, 0.12, th, -0.95, 0.20) * 6;

    // Orejas
    d += gauss(t, 0.02, 0.14, th, 1.5, 0.16) * 14;
    d += gauss(t, 0.02, 0.14, th, -1.5, 0.16) * 14;

    const sx = Math.sin(th);
    const cz = Math.cos(th);

    return [
        (HEAD_A * r * w + d) * sx,
        t * HEAD_B,
        (HEAD_C * r * dpt + d) * cz
    ];

}


/* Malla precalculada */

const ROWS = 56;
const COLS = 72;
const STRIDE = COLS + 1;
const VN = (ROWS + 1) * STRIDE;

const bx = new Float32Array(VN);
const by = new Float32Array(VN);
const bz = new Float32Array(VN);
const bnx = new Float32Array(VN);
const bnz = new Float32Array(VN);

const px = new Float32Array(VN);
const py = new Float32Array(VN);
const pnz = new Float32Array(VN);

for (let i = 0; i <= ROWS; i++) {

    const t = -0.98 + 1.96 * (i / ROWS);

    for (let j = 0; j <= COLS; j++) {

        const th = -Math.PI + (Math.PI * 2 * j) / COLS;
        const p = surf(t, th);
        const k = i * STRIDE + j;

        bx[k] = p[0];
        by[k] = p[1];
        bz[k] = p[2];
        bnx[k] = Math.sin(th);
        bnz[k] = Math.cos(th);

    }

}


/* Líneas de rasgos (cejas, nariz, labios, mandíbula) */

function makeFeature(fn, steps) {

    const pts = [];

    for (let s = 0; s <= steps; s++) {

        const [t, th] = fn(s / steps);
        const p = surf(t, th);

        pts.push({
            x: p[0] + Math.sin(th) * 1.5,
            y: p[1],
            z: p[2] + Math.cos(th) * 1.5,
            nx: Math.sin(th),
            nz: Math.cos(th),
            t: t
        });

    }

    return pts;

}

const features = [];

for (const s of [-1, 1]) {

    // Cejas
    features.push({
        w: 2,
        a: 0.60,
        pts: makeFeature(k => [-0.285 - 0.05 * Math.sin(k * Math.PI), s * (0.18 + 0.62 * k)], 24)
    });

    // Párpado superior (arco sobre el ojo)
    features.push({
        w: 1.2,
        a: 0.35,
        pts: makeFeature(k => [-0.10 - 0.045 * Math.sin(k * Math.PI), s * (0.28 + 0.44 * k)], 18)
    });

    // Bolsa inferior del ojo
    features.push({
        w: 1,
        a: 0.20,
        pts: makeFeature(k => [-0.10 + 0.05 * Math.sin(k * Math.PI), s * (0.30 + 0.40 * k)], 18)
    });

    // Línea del pómulo
    features.push({
        w: 1,
        a: 0.22,
        pts: makeFeature(k => [0.12 + 0.05 * k, s * (1.0 - 0.45 * k)], 18)
    });

    // Surco nasolabial
    features.push({
        w: 1.1,
        a: 0.28,
        pts: makeFeature(k => [0.32 + 0.22 * k, s * (0.22 + 0.12 * Math.sin(k * Math.PI * 0.9) + 0.10 * k)], 16)
    });

    // Puente de la nariz
    features.push({
        w: 1.2,
        a: 0.42,
        pts: makeFeature(k => [-0.10 + 0.37 * k, s * (0.05 + 0.05 * k)], 14)
    });

    // Mandíbula
    features.push({
        w: 1.3,
        a: 0.42,
        pts: makeFeature(k => [0.26 + 0.66 * k, s * (1.25 - 0.95 * k)], 22)
    });

}

// Base de la nariz
features.push({
    w: 1.2,
    a: 0.48,
    pts: makeFeature(k => [0.31 + 0.03 * Math.sin(k * Math.PI), -0.17 + 0.34 * k], 16)
});

// Labio superior (contorno)
features.push({
    w: 1.1,
    a: 0.38,
    pts: makeFeature(k => [0.50 - 0.028 * Math.sin(k * Math.PI), -0.27 + 0.54 * k], 20)
});

// Línea de la boca
features.push({
    w: 1.7,
    a: 0.62,
    pts: makeFeature(k => [0.555 + 0.012 * Math.cos((k - 0.5) * Math.PI * 1.6) - 0.012, -0.33 + 0.66 * k], 24)
});

// Labio inferior
features.push({
    w: 1.1,
    a: 0.35,
    pts: makeFeature(k => [0.585 + 0.05 * Math.sin(k * Math.PI), -0.24 + 0.48 * k], 18)
});

// Mentón
features.push({
    w: 1.1,
    a: 0.35,
    pts: makeFeature(k => [0.85 + 0.02 * Math.sin(k * Math.PI), -0.4 + 0.8 * k], 16)
});


/* =====================================================
   PROYECCIÓN
===================================================== */

let cY = 1, sY = 0, cP = 1, sP = 0;

function project(x, y, z, nx, nz, out) {

    const x1 = x * cY + z * sY;
    const z1 = -x * sY + z * cY;
    const y2 = y * cP - z1 * sP;
    const z2 = y * sP + z1 * cP;

    const k = 650 / (650 - z2);

    out.x = CX + x1 * k;
    out.y = CY + y2 * k;
    out.nz = (-nx * sY + nz * cY) * cP;
    out.k = k;

}

const tmp = { x: 0, y: 0, nz: 0, k: 1 };


/* =====================================================
   ROSTRO
===================================================== */

const LEVELS = 16;
const WIRE_MAX = 0.42;

function drawHalo() {

    // Aura general
    glowCircle(CX, CY, 235, "rgba(100,110,255,0.07)");
    glowCircle(CX, CY - 20, 150, "rgba(130,130,255,0.05)");

    // Anillos HUD rotando alrededor del rostro
    ctx.save();
    ctx.lineWidth = 1;

    ctx.strokeStyle = "rgba(140,150,255,0.14)";
    ctx.setLineDash([2, 10]);
    ctx.beginPath();
    ctx.arc(CX, CY, 222, time * 0.25, time * 0.25 + Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(140,150,255,0.22)";
    ctx.setLineDash([60, 40, 8, 40]);
    ctx.beginPath();
    ctx.arc(CX, CY, 236, -time * 0.18, -time * 0.18 + Math.PI * 2);
    ctx.stroke();

    ctx.restore();

}

function drawFace() {

    ctx.clearRect(0, 0, FACE_W, FACE_H);

    time += 0.016;

    /* Rotación según el mouse + leve vaivén natural */

    const mx = clamp((smoothMouse.x - window.innerWidth / 2) / (window.innerWidth / 2), -1, 1);
    const my = clamp((smoothMouse.y - window.innerHeight / 2) / (window.innerHeight / 2), -1, 1);

    const yaw = mx * 0.5 + Math.sin(time * 0.6) * 0.05;
    const pitch = -my * 0.22 + Math.sin(time * 0.8) * 0.02;

    cY = Math.cos(yaw);
    sY = Math.sin(yaw);
    cP = Math.cos(pitch);
    sP = Math.sin(pitch);

    const breathing = 1 + Math.sin(time * 1.1) * 0.008;

    drawHalo();


    /* Volumen interior (da profundidad al wireframe) */

    const bodyGrad = ctx.createRadialGradient(
        CX - 30 + yaw * 60, CY - 50, 10,
        CX, CY, 190
    );
    bodyGrad.addColorStop(0, "rgba(70,75,130,0.30)");
    bodyGrad.addColorStop(0.55, "rgba(20,22,40,0.45)");
    bodyGrad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(
        CX + yaw * 25,
        CY,
        HEAD_A * 0.95 * cY + 12,
        HEAD_B * 0.98,
        0, 0, Math.PI * 2
    );
    ctx.fill();


    /* Proyectar todos los vértices */

    const scanT = ((time * 0.35) % 2.6) - 1.3;

    for (let i = 0; i <= ROWS; i++) {

        for (let j = 0; j <= COLS; j++) {

            const k = i * STRIDE + j;

            project(bx[k], by[k] * breathing, bz[k], bnx[k], bnz[k], tmp);

            px[k] = tmp.x;
            py[k] = tmp.y;
            pnz[k] = tmp.nz;

        }

    }


    /* Efecto glitch: desplaza algunas filas */

    const glitching = glitchTimer > 0;
    const glitchBand = glitching ? Math.floor(Math.random() * ROWS) : -10;


    /* Malla: líneas agrupadas por nivel de opacidad */

    const paths = [];
    for (let n = 0; n < LEVELS; n++) paths.push(new Path2D());

    function addSeg(a, b, t) {

        const nz = (pnz[a] + pnz[b]) * 0.5;

        if (nz < -0.05) return;

        const front = Math.max(0, nz);
        const rim = Math.exp(-(nz * nz) / 0.02) * 0.12;
        const scan = Math.exp(-((t - scanT) * (t - scanT)) / 0.004) * 0.35;

        const alpha = Math.min(WIRE_MAX, 0.035 + 0.17 * Math.pow(front, 1.1) + rim + scan);
        const level = Math.round((alpha / WIRE_MAX) * (LEVELS - 1));

        paths[level].moveTo(px[a], py[a]);
        paths[level].lineTo(px[b], py[b]);

    }

    // Líneas horizontales
    for (let i = 0; i <= ROWS; i += 2) {

        const t = -0.98 + 1.96 * (i / ROWS);

        for (let j = 0; j < COLS; j++) {
            addSeg(i * STRIDE + j, i * STRIDE + j + 1, t);
        }

    }

    // Líneas verticales
    for (let j = 0; j < COLS; j += 4) {

        for (let i = 0; i < ROWS; i++) {

            const t = -0.98 + 1.96 * (i / ROWS);
            addSeg(i * STRIDE + j, (i + 1) * STRIDE + j, t);

        }

    }

    ctx.lineWidth = 0.8;

    for (let n = 1; n < LEVELS; n++) {

        ctx.strokeStyle =
            `rgba(135,145,255,${((n / (LEVELS - 1)) * WIRE_MAX).toFixed(3)})`;

        ctx.stroke(paths[n]);

    }


    /* Nodos en las intersecciones */

    for (let i = 0; i <= ROWS; i += 2) {

        for (let j = 0; j < COLS; j += 4) {

            const k = i * STRIDE + j;
            const nz = pnz[k];

            if (nz < 0.05) continue;

            const t = -0.98 + 1.96 * (i / ROWS);
            const scan = Math.exp(-((t - scanT) * (t - scanT)) / 0.004);
            const a = 0.10 + nz * 0.30 + scan * 0.5;

            ctx.fillStyle = `rgba(175,185,255,${Math.min(0.9, a).toFixed(3)})`;
            ctx.fillRect(px[k] - 1, py[k] - 1, 2, 2);

        }

    }


    /* Rasgos principales (más brillantes) */

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const f of features) {

        let prev = null;

        for (const p of f.pts) {

            project(p.x, p.y * breathing, p.z, p.nx, p.nz, tmp);

            const cur = { x: tmp.x, y: tmp.y, nz: tmp.nz };

            if (prev) {

                const nz = (prev.nz + cur.nz) * 0.5;

                if (nz > 0.02) {

                    ctx.strokeStyle =
                        `rgba(185,195,255,${(f.a * Math.min(1, nz * 1.4)).toFixed(3)})`;

                    ctx.lineWidth = f.w;
                    ctx.beginPath();
                    ctx.moveTo(prev.x, prev.y);
                    ctx.lineTo(cur.x, cur.y);
                    ctx.stroke();

                }

            }

            prev = cur;

        }

    }


    /* Ojos */

    const lookX = clamp(mx * 4.5, -4.5, 4.5);
    const lookY = clamp(my * 2.5, -2.5, 2.5);

    const openness = blink > 0 ? Math.abs(1 - blink * 2) : 1;

    for (const s of [-1, 1]) {

        const p = surf(-0.10, s * 0.5);

        project(p[0], p[1] * breathing, p[2] + 2, Math.sin(s * 0.5), Math.cos(s * 0.5), tmp);

        if (tmp.nz > -0.05) {

            drawEye(
                tmp.x,
                tmp.y,
                0.35 + 0.65 * Math.max(0, tmp.nz),
                openness,
                lookX,
                lookY
            );

        }

    }

    if (blink > 0) blink = Math.max(0, blink - 0.08);


    /* Barrido de escaneo (línea horizontal luminosa) */

    const scanY = CY + scanT * HEAD_B;

    if (scanT > -1 && scanT < 1) {

        const g = ctx.createLinearGradient(CX - 150, 0, CX + 150, 0);

        g.addColorStop(0, "rgba(130,140,255,0)");
        g.addColorStop(0.5, "rgba(170,180,255,0.35)");
        g.addColorStop(1, "rgba(130,140,255,0)");

        ctx.fillStyle = g;
        ctx.fillRect(CX - 150, scanY, 300, 1);

    }


    /* Glitch: cortes horizontales desplazados */

    if (Math.random() > 0.994) glitchTimer = 6;

    if (glitchTimer > 0) {

        for (let i = 0; i < 3; i++) {

            const sy = 120 + Math.random() * 280;
            const h = 3 + Math.random() * 14;
            const off = (Math.random() - 0.5) * 26;

            ctx.drawImage(
                faceCanvas,
                80, sy, 270, h,
                80 + off, sy, 270, h
            );

        }

        glitchTimer--;

    }

}


/* =====================================================
   OJOS
===================================================== */

function drawEye(x, y, scaleX, openness, lookX, lookY) {

    const w = 30 * scaleX;
    const h = 9 * openness;

    if (h < 0.6) {

        // Ojo cerrado: línea fina
        ctx.strokeStyle = "rgba(190,195,255,0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - w, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
        return;

    }

    // Aura
    glowCircle(x, y, 46, "rgba(120,130,255,0.16)");

    // Forma almendrada
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x, y - h * 2, x + w, y);
    ctx.quadraticCurveTo(x, y + h * 1.7, x - w, y);
    ctx.closePath();

    ctx.fillStyle = "rgba(6,7,18,0.85)";
    ctx.fill();

    ctx.clip();

    // Iris
    const ix = x + lookX * scaleX;
    const iy = y + lookY;

    const iris = ctx.createRadialGradient(ix, iy, 1, ix, iy, 14);

    iris.addColorStop(0, "rgba(245,245,255,1)");
    iris.addColorStop(0.25, "rgba(170,178,255,1)");
    iris.addColorStop(0.6, "rgba(95,105,255,0.85)");
    iris.addColorStop(1, "rgba(50,50,130,0)");

    ctx.fillStyle = iris;
    ctx.beginPath();
    ctx.arc(ix, iy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Pupila
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(ix, iy, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Reflejo
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(ix - 4, iy - 2, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Contorno del párpado
    ctx.strokeStyle = "rgba(200,205,255,0.45)";
    ctx.lineWidth = 1.1;

    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x, y - h * 2, x + w, y);
    ctx.quadraticCurveTo(x, y + h * 1.7, x - w, y);
    ctx.stroke();

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

    smoothMouse.x = lerp(smoothMouse.x, mouse.x, 0.07);
    smoothMouse.y = lerp(smoothMouse.y, mouse.y, 0.07);

    const movementX =
        (smoothMouse.x - window.innerWidth / 2) * 0.010;

    const movementY =
        (smoothMouse.y - window.innerHeight / 2) * 0.006;

    faceContainer.style.transform =
        `translate(
            calc(-50% + ${movementX}px),
            calc(-50% + ${movementY}px)
        )`;

    drawFace();

    drawParticles();

    requestAnimationFrame(animate);

}


/* =====================================================
   BOTÓN
===================================================== */

const enterButton = document.getElementById("enterButton");

enterButton.addEventListener("click", () => {

    document.querySelector(".story").scrollIntoView({
        behavior: "smooth"
    });

});


/* =====================================================
   CONTADOR
===================================================== */

const currentMembers = 0;

const memberCount = document.getElementById("memberCount");
const progressBar = document.getElementById("progressBar");

memberCount.textContent = currentMembers;

progressBar.style.width = `${(currentMembers / 500) * 100}%`;


/* =====================================================
   CARGA
===================================================== */

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 1300);

});


/* =====================================================
   INICIAR
===================================================== */

animate();
