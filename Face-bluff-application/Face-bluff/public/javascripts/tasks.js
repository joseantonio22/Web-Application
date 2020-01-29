//<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
//<script src="/javascripts/tasks.js"></script>
"use strict";

/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    //mostramos simultaneamente el nombre e la tarea
    $("#nombreT").on("keyup", anadirNombre);
    //$("#nombreT").on("change", anadirNombre);


    //almacenamos y mostramos los tags
    $("#botonAñadirTag").on("click", anadirTag);    
    //creamos el evento para el div nuevo
    $("#resultado div");
    //ponemos como oculto el contenido del formulario(porque en el domo no esta cargado)
    $("#nombre").hide;
    //procesamos el envio del formulario
    $("#añadir").on("click", enviarBBDD);
});



let arrayTags=[];
var string="";

function anadirNombre() { 
    let task=$("#nombreT").val();
    string = task;
    $("#resultado").text(task);
 }

function anadirTag(event) {   
   let tag=$("#nombreTag").val();
   //comprobar que no este reperitod el tag
   arrayTags.push($("#nombreTag").val());
   console.log(arrayTags + "arrayTags" + "*********************");
   string +=" @" + tag;

   $("#resultado").append('<div class="decoradoTags">'+ tag+'</div>');//mostrarlo en pantalla
   $("#nombreTa").val("");//para vaciar
   event.preventDefault();   
}

//le pasamos a nombre(que es el nombre del formulario para que en el post se pueda acceder a su valor con el req.body.nombre)
function enviarBBDD(event) {   
    $("#nombre").val(string); 
 }

