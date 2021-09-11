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


    /**
    * Eventos
    */

    // Evento para el input de subir una imagen al canvas
    inputUpload.addEventListener("change", function (e) {
        uploadImg(e);
    });

    // Evento para descargar el canvas como imagen
    btnDownload.addEventListener("click", downloadImage);


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

}