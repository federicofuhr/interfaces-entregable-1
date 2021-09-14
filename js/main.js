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

    // Boton para recuperar la imagen original
    let btnImageRecovery = document.querySelector("#btn-image-recovery");

    // Boton del lapiz
    let btnPencil = document.querySelector("#btn-pencil");

    // Boton de la goma
    let btnEraser = document.querySelector("#btn-eraser");

    // Boton del filtro binarizacion
    let btnGrayscale = document.querySelector("#grayscale-filter");

    // Boton del filtro negativo
    let btnNegative = document.querySelector("#negative-filter");

    // Boton del filtro sepia
    let btnSepia = document.querySelector("#sepia-filter");

    // Boton del filtro blur
    let btnBlur = document.querySelector("#blur-filter");

    // mouseX y mouseY almacenan la posicion del cursor en X e Y, respecto al padding del elemento currentTarget (para lapiz y goma)
    let mouseX = 0;
    let mouseY = 0;
    // pressingBtn indica que el boton del mouse esta siendo presionado (para lapiz y goma)
    let pressingBtn = false;
    // drawing indica que esta activado el lapiz
    let drawing = true;
    // Grosor de la linea para dibujar o borrar
    let lineWidth;

    // imageData de la imagen original
    let originalImage;
    let imageDataOriginal;
    let imageData;
    let imageAspectRatio;
    let imageScaledWidth;
    let imageScaledHeight;

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

    // Evento para el filtro de desenfoque
    btnBlur.addEventListener("click", function () {
        ctx.drawImage(originalImage, 0, 0, imageScaledWidth, imageScaledHeight);
        imageData = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
        roamImage(imageData, applyBlurFilter);
        ctx.putImageData(imageData, 0, 0);
    });

    // Evento para el filtro de binarizacion
    btnGrayscale.addEventListener("click", function () {
        ctx.drawImage(originalImage, 0, 0, imageScaledWidth, imageScaledHeight);
        imageData = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
        roamImage(imageData, applyGrayFilter);
        ctx.putImageData(imageData, 0, 0);
    });

    // Evento para el filtro negativo
    btnNegative.addEventListener("click", function () {
        ctx.drawImage(originalImage, 0, 0, imageScaledWidth, imageScaledHeight);
        imageData = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
        roamImage(imageData, applyNegativeFilter);
        ctx.putImageData(imageData, 0, 0);
    });

    btnSepia.addEventListener("click", function () {
        ctx.drawImage(originalImage, 0, 0, imageScaledWidth, imageScaledHeight);
        imageData = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
        roamImage(imageData, applySepiaFilter);
        ctx.putImageData(imageData, 0, 0);
    });

    // Evento para activar la funcion del lapiz
    btnPencil.addEventListener("click", () => { drawing = true });
    // Evento para activar la funcion de la goma
    btnEraser.addEventListener("click", () => { drawing = false });

    canvas.addEventListener('mousedown', e => {
        //OffsetX y offsetY contienen la posicion x,y del cursor respecto del padding del elemento que tiene cargado el evento.
        mouseX = e.offsetX;
        mouseY = e.offsetY;
        //Esto indica que se presiono un boton.
        pressingBtn = true;
        if (drawing) {
            lineWidth = 5;
            ctx.strokeStyle = document.querySelector("#pencil-color").value;
        } else {
            lineWidth = 45;
            ctx.strokeStyle = "white";
        }
        drawLine(ctx, mouseX, mouseY, mouseX, mouseY, lineWidth);
    });

    btnImageRecovery.addEventListener("click", function () {
        ctx.putImageData(imageDataOriginal, 0, 0);
    });

    canvas.addEventListener('mousemove', e => {
        //Comprueba si el boton del mouse sigue presionado.
        if (pressingBtn) {
            drawLine(ctx, mouseX, mouseY, e.offsetX, e.offsetY, lineWidth);
            //Guarda la nueva posicion X e Y, que es donde se detecto el ultimo evento.
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
    });

    window.addEventListener('mouseup', () => {
        //Indica que el boton fue soltado.
        pressingBtn = false;
        //Vuelve a setear en 0 el X e Y del cursor para evitar  que se mezcle con las siguientes lineas que quiera dibujar.
        mouseX = 0;
        mouseY = 0;
    });


    /**
    * Funciones
    */

    // Recibe 3 arrays y promedia los valores de cada uno para retornarlos encapsulados en un objeto.
    function getAverageRGB(r, g, b) {
        let avgR = 0;
        let avgG = 0;
        let avgB = 0;
        for (let i = 0; i < r.length; i++) {
            avgR += r[i];
            avgG += g[i];
            avgB += b[i];
        }
        let rgb = {
            'r': avgR / r.length,
            'g': avgG / r.length,
            'b': avgB / r.length
        }
        return rgb;
    }

    // Recibe imageData, 3 array y una posicion, carga los 3 array con la componente rgb correspondiente en esa posicion del imageData.data .
    function pushRGB(imageData, r, g, b, pos) {
        let rgb = getRGB(imageData, pos);
        r.push(rgb.r);
        g.push(rgb.g);
        b.push(rgb.b);
    }


    // Retorna un pequeño objeto que encapsula los valores de los componentes del RGB.
    function getRGB(imageData, i) {
        let data = imageData.data;
        let rgb = {
            'r': data[i],
            'g': data[i + 1],
            'b': data[i + 2]
        }
        return rgb;
    }

    function getNeighbourPixels(imageData, x, y) {
        let r = [];
        let g = [];
        let b = [];
        if ((x - 1 >= 0) && (y + 1 < imageData.height)) {
            let topLeft = getIndex(imageData, x - 1, y + 1);
            pushRGB(imageData, r, g, b, topLeft);
        }
        if (y + 1 < imageData.height) {
            let top = getIndex(imageData, x, y + 1);
            pushRGB(imageData, r, g, b, top);
        }
        if ((x + 1 < imageData.width) && (y + 1 < imageData.height)) {
            let topRight = getIndex(imageData, x + 1, y + 1);
            pushRGB(imageData, r, g, b, topRight);
        }
        if (x - 1 >= 0) {
            let left = getIndex(imageData, x - 1, y);
            pushRGB(imageData, r, g, b, left);
        }
        let center = getIndex(imageData, x, y);
        pushRGB(imageData, r, g, b, center);
        if (x + 1 < imageData.width) {
            let right = getIndex(imageData, x + 1, y);
            pushRGB(imageData, r, g, b, right);
        }
        if ((x - 1 >= 0) && (y - 1 >= 0)) {
            let bottomLeft = getIndex(imageData, x - 1, y - 1);
            pushRGB(imageData, r, g, b, bottomLeft);
        }
        if (y - 1 >= 0) {
            let bottom = getIndex(imageData, x, y - 1);
            pushRGB(imageData, r, g, b, bottom);
        }
        if ((x + 1 < imageData.width) && (y - 1 >= 0)) {
            let bottomRight = getIndex(imageData, x + 1, y - 1);
            pushRGB(imageData, r, g, b, bottomRight);
        }
        return getAverageRGB(r, g, b);
    }

    function applyBlurFilter(imageData, x, y) {
        let avgPixel = getNeighbourPixels(imageData, x, y);
        let i = getIndex(imageData, x, y);
        let data = imageData.data;
        data[i] = avgPixel.r;
        data[i + 1] = avgPixel.g;
        data[i + 2] = avgPixel.b;
    }

    function roamImage(imageData, imageFilter) {
        //Se encarga de recorrer la matriz imagen. En sus argumentos recibe imageData y una funcion encargada de aplicar un determinado filtro.
        for (let x = 0; x < imageData.width; x++) {
            for (let y = 0; y < imageData.height; y++) {
                imageFilter(imageData, x, y);
            }
        }
    }

    function applySepiaFilter(imageData, x, y) {
        let i = getIndex(imageData, x, y);
        let data = imageData.data; //data contiene la informacion de los pixeles de la imagen (rgba) en un array.
        //Obtengo los valores de los 3 componentes del color del pixel.
        let red = data[i];
        let green = data[i + 1];
        let blue = data[i + 2];
        data[i + 0] = Math.min((0.393 * red) + (0.769 * green) + (0.189 * (blue)), 255.0); //red
        data[i + 1] = Math.min((0.349 * red) + (0.686 * green) + (0.168 * (blue)), 255.0); //green
        data[i + 2] = Math.min((0.272 * red) + (0.534 * green) + (0.131 * (blue)), 255.0); //blue
        if (data[i + 2] > 255) {
            data[i + 2] = 255;
        }
        if (data[i + 1] > 255) {
            data[i + 1] = 255;
        }
        if (data[i + 0] > 255) {
            data[i + 0] = 255;
        }
    }

    function applyNegativeFilter(imageData, x, y) {
        let i = getIndex(imageData, x, y);
        let data = imageData.data; //data contiene la informacion de los pixeles de la imagen (rgba) en un array.
        //Se le resta 255 a los 3 componentes del color para obtener el filtro negativo.
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    // Funcion para descargar el canvas como una imagen
    function downloadImage() {
        let link = document.createElement('a');
        link.download = 'image.jpg';
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
                originalImage = this;
                imageData = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
                imageDataOriginal = ctx.getImageData(0, 0, imageScaledWidth, imageScaledHeight);
                ctx.putImageData(imageData, 0, 0);
            });
        });
    }

    //Realiza el calculo de conversion de los indices x e y para retornar una posicion del arreglo imageData.data .
    function getIndex(imageData, x, y) {
        let index = (x + y * imageData.width) * 4;
        return index;
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

    function applyGrayFilter(imageData, x, y) {
        // Recibe imageData y un indice para aplicar el filtro sobre un pixel en concreto.
        let data = imageData.data;
        let i = getIndex(imageData, x, y);
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3; //Formula para calcular el gris.
        // Aplica el nuevo valor a cada componente del color.
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
}