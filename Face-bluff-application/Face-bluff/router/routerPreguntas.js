"use strict";
const express = require("express");
const preguntasRouter = express.Router();
const bodyParser = require("body-parser");
const daoPregunta = require ('../dao/daoPregunta'); 

let daoPreguntas = new daoPregunta("localhost", "root", "", "redSocial");  //dao para la base de datos

function verifyUser(request,response,next){
    if(request.session.currentUser===undefined){
        response.redirect('/usuarios/login.html');
    }else{
        next();
    }
}

preguntasRouter.get("/tablero.html", verifyUser,(req, res) => {
    daoPreguntas.showQuestions((err, fila) => {
        if (err) {
            console.log(err);
        } else {
            let preguntas = [];
            
            if(fila.length >= 5){
                let numLista = [];
                numLista.length = fila.length;
                for(var i = 0; i < 5; ++i){
                    let cuerpo={p:"",i:0};
                    let numRandom = Math.floor((Math.random() * fila.length));
                    while(-1 !== numLista.indexOf(numRandom)){
                        numRandom = Math.floor((Math.random() * fila.length));
                    }
                    numLista[numRandom] = numRandom;
                    cuerpo.p = fila[numRandom].pregunta;
                    cuerpo.i = numRandom; 
                    preguntas.push([cuerpo]);
                }
            } 
            else{
                for(var i = 0; i < fila.length; ++i){
                    let cuerpo={p:"",i:0};
                    cuerpo.p = fila[i].pregunta;
                    cuerpo.i = fila[i].id;
                    preguntas.push([cuerpo]);
                }      
                
            }
            res.render("questions.ejs", {preguntas: preguntas, puntos:req.session.puntos});
        }
    })
});

preguntasRouter.get("/crearPregunta.html", verifyUser, function(req, res) {
    res.status(200);
    res.render("createQuestions.ejs", {puntos:req.session.puntos});
});

/*********************** */
preguntasRouter.post("/adivinarPregunta", verifyUser, (req, res) => { 
    res.status(200);
    daoPreguntas.showTheAnswers(req.body.idPregunta, function(err,fila){
        if (err) {
            console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
            console.log(err);
        }
        else {          
            daoPreguntas.searchQuestion(req.body.idPregunta, function(err,fila2){
                if (err) {
                    console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
                    console.log(err);
                }
                else {  
                    var arrayDeRespuestas = fila[0].respuestas.split(",");
                    if(arrayDeRespuestas.length > 4){
                        let arrayDeRespuestas2 = [];

                        let numRandom = Math.floor((Math.random() * arrayDeRespuestas.length)); 
                        while(arrayDeRespuestas2.length < 3){

                            if((arrayDeRespuestas[numRandom] != req.body.respuestaAmigo)&&(arrayDeRespuestas2.indexOf(arrayDeRespuestas[numRandom])===-1)){
                                arrayDeRespuestas2.push(arrayDeRespuestas[numRandom] );
                            }
                            numRandom = Math.floor((Math.random() * arrayDeRespuestas.length));                         
                        }
                        arrayDeRespuestas2.push(req.body.respuestaAmigo);
                        //par que la ultima respuesta(la correcta) no sea siempre la ultima
                        let numRandom2 = Math.floor((Math.random() * arrayDeRespuestas2.length));
                        var aux = arrayDeRespuestas2[numRandom2];
                        arrayDeRespuestas2[numRandom2] = req.body.respuestaAmigo;
                        arrayDeRespuestas2[arrayDeRespuestas2.length-1] = aux; 

                        arrayDeRespuestas = arrayDeRespuestas2;
                    }
                    res.render("tryGuess.ejs", {nombrePregunta: fila2[0].pregunta, respuestas: arrayDeRespuestas, respuestaAmigo: req.body.respuestaAmigo, emailAmigo: req.body.emailAmigo, idPregunta: req.body.idPregunta, puntos:req.session.puntos});                            
                }
            }); 
        }
    });    
});

///preguntas/adivinarPregunta
preguntasRouter.post("/insertarPregunta", verifyUser, (req, res) => { 
    res.status(200);
    daoPreguntas.insertQuestions(req.body.pregunta, req.body.respuestas,function(err,fila){
        if (err) {
            console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
            console.log(err);
        }
        else {             
            res.redirect("/preguntas/tablero.html");                      
        }
    });    
});

preguntasRouter.post("/comprobarAdivinacion", verifyUser,(req, res) => { 
    res.status(200);
    var adivinada = false;
    if(req.body.respuestaAmigo == req.body.respuestaMia){
        adivinada = true;
        req.session.puntos = req.session.puntos + 50;
        daoPreguntas.insertPonitsGessedQuestion(req.session.currentUser, function(err){
            if (err) {
                console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
                console.log(err);
            }
        });
    }
    daoPreguntas.insertGuessing(req.session.currentUser, req.body.emailAmigo, req.body.idPregunta, adivinada, function(err,fila){
        if (err) {
            console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
            console.log(err);
        }
        else {             
            res.redirect("/preguntas/tablero.html");                      
        }
    });    
});

preguntasRouter.post("/seleccionarPregunta", verifyUser, (req, res) => { 
    res.status(200);

    daoPreguntas.searchQuestionAnswered(req.session.currentUser, req.body.idPregunta, function(err, fila){
        if(err){
            console.log(err);
        }
        else{
            daoPreguntas.friendsAnswersG(req.session.currentUser, req.body.idPregunta, function(err, fila2){
                if(err){
                    console.log(err);
                }
                else{ 
                    daoPreguntas.friendsAnswersNG(req.session.currentUser, req.body.idPregunta, function(err, fila3){
                        if(err){
                            console.log(err);
                        }
                        else{   
                            let aux = [];
                            //si no tiene imagen, lo ponemos a vacio
                            fila2.forEach(x => {
                                if(String(x.imagen)==='undefined' || String(x.imagen)==='null' || String(x.imagen)===""){
                                    x.imagen = "vacio";
                                }
                            })

                            fila3.forEach(x => {
                                var  existe = false
                                fila2.forEach(y =>{ 
                                    if(x.email === y.email){ 
                                        existe = true;
                                    }
                                })
                                if(!existe){
                                    if(String(x.imagen)==='undefined' || String(x.imagen)==='null' || String(x.imagen)===""){                
                                        x.imagen = "vacio";
                                    }
                                    aux.push(x);
                                }
                            }) 
                            res.render("selectedQuestions.ejs", {idPregunta: req.body.idPregunta, pregunta: req.body.pregunta, fila: fila, adivinadas: fila2, porAdivinar: aux, puntos:req.session.puntos}); 
                        }
                    });
                }
            });
        }
    });

     
});

preguntasRouter.post("/contestarPregunta", verifyUser, (req, res) => { 
    res.status(200);

    daoPreguntas.searchQuestion(req.body.idPregunta, function(err,fila){
        if (err) {
            console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
            console.log(err);
        }
        else { 
            //tratar fila
            var arrayDeRespuestas = fila[0].respuestas.split(","); 
            
            res.render("answerQuestion.ejs", {idPregunta: fila[0].id, pregunta: fila[0].pregunta, respuestas: arrayDeRespuestas, puntos:req.session.puntos });                      
        }
    });    
});

///insertarRespuesta

preguntasRouter.post("/insertarRespuesta", verifyUser, (req, res) => { 
    res.status(200);
    daoPreguntas.insertAnswer(req.session.currentUser, req.body.idPregunta, req.body.respuesta, function(err,fila){
        if (err) {
            console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
            console.log(err);
        }
        else {  
            res.redirect("/preguntas/tablero.html");                      
        }
    });    
});

//insertarNuevaRespuesta
preguntasRouter.post("/insertarNuevaRespuesta", verifyUser, (req, res) => { 
    res.status(200);

    //buscamos la respuesta de la pregunta
    daoPreguntas.searchQuestion(req.body.idPregunta, function(err,fila){
        if (err) {
            console.log(err);
        }
        else { //hacemos un update a las respuestas de la pregunta añadiendo la nueva
            daoPreguntas.insertNewAnswerIntoQuestion(req.body.idPregunta, fila[0].respuestas + "," + req.body.respuesta, function(err){
                if (err) {
                    console.log(err);
                }
                else {  
                    daoPreguntas.insertAnswer(req.session.currentUser, req.body.idPregunta, req.body.respuesta, function(err){
                        if (err) {
                            console.log(err);
                        }
                        else {
                            res.redirect("/preguntas/tablero.html");                      
                        }
                    });                      
                }
            });                  
        }
    });   
});

module.exports = preguntasRouter;