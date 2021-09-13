document.addEventListener("DOMContentLoaded", init);

function init() {
    "use strict";

    /**
    * Inicializacion de constantes y variables
    */

    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // Input para subir la imagen
    let inputUpload = document.querySelector("#input-upload");

    // Boton para descargar el contenido del canvas como imagen
    let btnDownload = document.querySelector("#btn-download");
    
    // Boton para limpiar el canvas
    let btnCleaner = document.querySelector("#btn-clear");

    // Boton del lapiz
    let btnPencil = document.querySelector("#btn-pencil");

    // Boton de la goma
    let btnEraser = document.querySelector("#btn-eraser");

    // mouseX y mouseY almacenan la posicion del cursor en X e Y, respecto al padding del elemento currentTarget (para lapiz y goma)
    let mouseX = 0;
    let mouseY = 0;
    // pressingBtn indica que el boton del mouse esta siendo presionado (para lapiz y goma)
    let pressingBtn = false;
    // drawing indica que esta activado el lapiz
    let drawing = true;
    // Grosor de la linea para dibujar o borrar
    let lineWidth;


    /**
    * Eventos
    */

    // Evento para el input de subir una imagen al canvas
    inputUpload.addEventListener("change", function (e) {
        uploadImg(e);
    });

    // Evento para descargar el canvas como imagen
    btnDownload.addEventListener("click", downloadImage);

    // Evento para limpiar el canvas
    btnCleaner.addEventListener("click", clearCanvas);

    // Evento para activar la funcion del lapiz
    btnPencil.addEventListener("click", () => { drawing = true});
    // Evento para activar la funcion de la goma
    btnEraser.addEventListener("click", () => { drawing = false});

    canvas.addEventListener('mousedown', e => {
        mouseX = e.offsetX;//OffsetX y offsetY contienen la posicion x,y del cursor respecto del padding del elemento que tiene cargado el evento.
        mouseY = e.offsetY;
        pressingBtn = true;//Esto indica que se presiono un boton.
        if (drawing) {
            lineWidth = 5;
            ctx.strokeStyle = document.querySelector("#pencil-color").value; 
        } else {
            lineWidth = 45;
            ctx.strokeStyle = "white";
        }
            
        drawLine(ctx, mouseX, mouseY, mouseX, mouseY, lineWidth);/*le puse +2 para que dibuje algo cuando quiera hacer solo un punto, 
        para el entregable habra que reemplazarlo por un rectangulo para controlar mejor el tamaño.*/
    });
    
    canvas.addEventListener('mousemove', e => {
        if (pressingBtn) {//Comprueba si el boton del mouse sigue presionado.
            drawLine(ctx, mouseX, mouseY, e.offsetX, e.offsetY, lineWidth);
            mouseX = e.offsetX;//Guarda la nueva posicion X e Y, que es donde se detecto el ultimo evento.
            mouseY = e.offsetY;
        }
    });
    
    window.addEventListener('mouseup', () => {
        pressingBtn = false;//Indica que el boton fue soltado.
        mouseX = 0;//Vuelve a setear en 0 el X e Y del cursor para evitar  que se mezcle con las siguientes lineas que quiera dibujar.
        mouseY = 0;
    });


    /**
    * Funciones
    */

    // Funcion para descargar el canvas como una imagen
    function downloadImage() {
        let link = document.createElement('a');
        link.download = 'image.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    // Funcion para subir una imagen al canvas
    function uploadImg(e) {
        clearCanvas();
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener("load", function (readerEvent) {
            let content = readerEvent.target.result;
            let image = new Image();
            image.src = content;
            let imageAspectRatio;
            let imageScaledWidth;
            let imageScaledHeight;
            let oldImage;
            image.addEventListener("load", function () {
                if (this.width > this.height) {
                    imageAspectRatio = (1.0 * this.height) / this.width;
                    imageScaledWidth = canvas.width;
                    imageScaledHeight = canvas.width * imageAspectRatio;
                } else {
                    imageAspectRatio = (1.0 * this.width) / this.height;
                    imageScaledWidth = canvas.height;
                    imageScaledHeight = canvas.width * imageAspectRatio;
                }
                ctx.drawImage(this, 0, 0, imageScaledWidth, imageScaledHeight);
                let imageData = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
                oldImage = imageData;
                ctx.putImageData(imageData, 0, 0);
            });
        });
    }

    // Funcion para limpiar el lienzo
    function clearCanvas() {
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.closePath();
    }   
    
    // Funcion para dibujar lineas en el canvas ya sea mediante el lapiz o la goma
    function drawLine(context, x1, y1, x2, y2, lineWidth) {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = lineWidth;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }
}