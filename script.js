const face = document.querySelector(".face");
const eyes = document.querySelectorAll(".eye");
const button = document.getElementById("enterButton");

document.addEventListener("mousemove", (event) => {

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const moveX = (mouseX - centerX) / 35;
    const moveY = (mouseY - centerY) / 35;

    // Movimiento de la cabeza
    face.style.transform =
        `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

    // Movimiento de los ojos
    eyes.forEach((eye) => {

        const eyeMoveX = (mouseX - centerX) / 80;
        const eyeMoveY = (mouseY - centerY) / 80;

        eye.style.transform =
            `translate(${eyeMoveX}px, ${eyeMoveY}px)`;

    });

});


/* Pequeña reacción cuando el cursor entra en el botón */

button.addEventListener("mouseenter", () => {

    face.style.filter =
        "brightness(1.5)";

});


button.addEventListener("mouseleave", () => {

    face.style.filter =
        "brightness(1)";

});


/* Efecto de entrada */

window.addEventListener("load", () => {

    document.body.style.opacity = "0";

    setTimeout(() => {

        document.body.style.transition =
            "opacity 1.5s ease";

        document.body.style.opacity = "1";

    }, 100);

});
