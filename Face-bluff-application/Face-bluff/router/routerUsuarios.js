"use strict";
const express = require("express");
const userRouter = express.Router();
const bodyParser = require("body-parser");
const dao = require ('../dao/daoUsuarios');
const path = require("path");
const perfilConImagen = path.join(__dirname, "..", "profile_imgs"); 
const perfilSinImagen = path.join(__dirname, "..", "public", "img", "NoPerfil.png");

let daoUsuarios = new dao("localhost", "root", "", "redSocial");  //dao para la base de datos


function verifyUser(req,response,next){
    if(req.session.currentUser===undefined){
        response.redirect('/usuarios/login.html');
    }else{
        next();
    }
}

userRouter.get("/login.html", function(req, response) {
    response.status(200);
    response.render("login", {error:""});
});

userRouter.get("/newUser.html", function(req, response) {
    response.status(200);
    response.render("newUser", {});
});

userRouter.post('/form_login.html', (req, res) => { //recoje el formulario de un inicio de sesio
    res.status(200);
    var email=req.body.email;
    var contraseña=req.body.contraseña;
    daoUsuarios.bucarUsuario(email,contraseña,function(err,tipo,fila){
        if (err) {
            console.log("ERROR EN LA BUSQUEDA DE USUARIO");
            console.log(err);
        }
        else {
            if(tipo){                
                console.log("USUARIO LOGIN");
                req.session.currentUser = fila[0].email;
                req.session.contraseña = fila[0].contraseña;
                req.session.nombreCompleto = fila[0].nombreCompleto;
                req.session.fechaNacimiento = fila[0].fechaNacimiento;
                req.session.sexo = fila[0].sexo;
                req.session.imagen = fila[0].imagen;
                req.session.puntos = fila[0].puntos;                
                res.redirect("/usuarios/profile.html");
            }
            else{
                console.log("EMAIL O CONTRASEÑA INCORRECTOS")
                res.render("login", {error:"EMAIL O CONTRASEÑA INCORRECTOS"});
            }
        }
    });     
});

userRouter.post('/form_newUser.html', (req, res) => { //recoje el formulario de un nuevo usuario
    res.status(200);
    let sexoStr = "No especificado";
    switch (req.body.sexo) {
        case "H": sexoStr = "Hombre"; break;
        case "M": sexoStr = "Mujer"; break;
    }

    let usuario = {        
        email:req.body.email,
        contraseña:req.body.contraseña,
        nombreCompleto:req.body.nombreCompleto,
        sexo:sexoStr,
        fechaNacimiento:req.body.fechaNacimiento,
        imagen:req.body.imagen
    };
    if(req.body.imagen === ""){
        usuario.imagen = "vacio";
    }

    daoUsuarios.insertarUsuario(usuario,function(err){
        if (err) {
            console.log("ERROR EN LA INSERCIÓN DE USUARIO");
            console.log(err);
        }
        else {
            console.log("USUARIO INSERTADO CORRECTAMENTE");
            res.redirect("/usuarios/login.html");
        }
    });
});

userRouter.get("/profile.html", verifyUser, function(req, res) {
    res.status(200);
    var contraseña=" ";
    
    daoUsuarios.bucarUsuario(req.session.currentUser,contraseña,function(err,tipo,fila){
        if (err) {
            console.log("ERROR EN LA BUSQUEDA DE USUARIO");
            console.log(err);
        }
        else {
            daoUsuarios.cargarFotosUsuario(req.session.currentUser, function(err,fila2){
                if (err) {
                    console.log("ERROR EN LA carga de fotos DEl USUARIO");
                    console.log(err);
                }
                else { 
                    let arrayFotos = [];
                    fila2.forEach(element => {
                        let foto={
                            email: element.email,
                            imagen: element.imagen,
                            descripcion: element.descripcion
                        }
                        arrayFotos.push(foto);
                    });

                    res.render("profile", {user:fila[0].nombreCompleto, edad:fila[0].fechaNacimiento, sexo:fila[0].sexo, fotos:arrayFotos, puntos:req.session.puntos}); 
                }
            });
        }
    });
    
});

userRouter.get("/modProfile.html", verifyUser, function(req, res) {  
           
    res.render("modProfile", {puntos:req.session.puntos});       
    
});

userRouter.post('/form_modProfile.html', verifyUser, (req, res) => { //recoje el formulario de un nuevo usuario
    res.status(200);
    console.log(req.body.contraseña + " " +  req.body.nombreCompleto + " " + req.body.fechaNacimiento);
    //contraseña
    console.log("contraseña body: " + req.body.contraseña + "contraseña del session: " + req.session.contraseña);
    if(req.body.contraseña !== ""){
        console.log("cambiando la contraseña");
        req.session.contraseña = req.body.contraseña;
    }
    //nombreCompleto
    if(req.body.nombreCompleto !== ""){
        req.session.nombreCompleto = req.body.nombreCompleto;
    }
    //fechaNacimiento
    if(req.body.fechaNacimiento !== ""){
        req.session.fechaNacimiento = req.body.fechaNacimiento;
    }
    //sexo
    let sexoStr = "No especificado";
    switch (req.body.sexo) {
        case "H": sexoStr = "Hombre"; break;
        case "M": sexoStr = "Mujer"; break;
    }
    if(sexoStr !== ""){
        req.session.sexo = sexoStr;
    }
    //imagen    
    if(req.body.imagen !== ""){
        req.session.imagen = req.body.imagen;
    }
    //puntos no se pueden modificar
    let usuario = {        
        email:req.session.currentUser,
        contraseña:req.session.contraseña,
        nombreCompleto:req.session.nombreCompleto,
        sexo:req.session.sexo,
        fechaNacimiento:req.session.fechaNacimiento,
        imagen:req.session.imagen
    };

    daoUsuarios.modificarUsuario(usuario,function(err){
        if (err) {
            console.log("ERROR EN LA MODIFICACION DE USUARIO");
            console.log(err);

        }
        else {
            console.log("USUARIO MODIFICADO CORRECTAMENTE");
            res.redirect("/usuarios/profile.html");
        }
    });
});

userRouter.get("/friends.html", verifyUser, function(req, response) {
    response.status(200);
    
    daoUsuarios.bucarAmigos(req.session.currentUser,(err,filas)=>{
        if (err) {
            console.log("ERROR EN LA CONSULTA DE AMIGOS");
            console.log(err);
        }
        else { 
            let listaAmigos=[];
        
            filas.forEach(element => {
                    let amigo={
                        nombreCompleto: element.nombreCompleto,
                        email: element.email,
                        imagen: element.imagen
                    }
                    /*if(element.imagen === null){
                        amigo.imagen = "vacio";
                    }*/
                    listaAmigos.push(amigo);
            });
         
            daoUsuarios.bucarSolicitudes(req.session.currentUser,(err,filas)=>{
                if (err) {
                    console.log("ERROR EN LA CONSULTA DE AMIGOS");
                    console.log(err);
                }
                else { 
                    let listaSolicitudes=[];
                    
                    filas.forEach(element => {
                        let sol={
                            nombreCompleto: element.nombreCompleto,
                            email: element.email,
                            imagen: element.imagen
                        }
                        /*if(element.imagen === null){
                            sol.imagen = "vacio";
                        }*/
                        listaSolicitudes.push(sol);
                    });        
                    response.render("friends", {amigos:listaAmigos, solicitudes:listaSolicitudes, puntos:req.session.puntos});                    
                }  
            });
        }  
    });
});

userRouter.post("/amigos/AceptarSolicitud", verifyUser, (req, res) => { 
    res.status(200);

    daoUsuarios.aceptarSolicitud(req.body.user,req.session.currentUser,function(err,tipo,fila){
        if (err) {
            console.log("ERROR ACEPTAR SOLICITUD");
            console.log(err);
        }
        else {            
            res.redirect("/usuarios/friends.html");            
        }
    });
});

userRouter.post("/amigos/RechazarSolicitud", verifyUser, (req, res) => { 
    res.status(200);
    
    console.log(req.body.user);
    daoUsuarios.rechazarSolicitud(req.body.user,req.session.currentUser,function(err,fila){
        if (err) {
            console.log("ERROR RECHAZAR SOLICITUD");
            console.log(err);    
        }
        else {            
            res.redirect("/usuarios/friends.html");            
        }
    });
});

userRouter.post("/amigos/buscarUsuarios", verifyUser, (req, res) => { 
    res.status(200);

    daoUsuarios.bucarPerfiles(req.session.currentUser,req.body.nombreBuscar,function(err,fila){
        if (err) {
            console.log("ERROR EN LA CONSULTA DE BUSQUEDA");
            console.log(err);

        }
        else { 
            if(fila.length <= 0){
                res.render("peopleSearched", {busqueda:fila,busquedaVacia:"No se han encontrado resultados", puntos:req.session.puntos});
            } 
            else{
                res.render("peopleSearched", {busqueda:fila,busquedaVacia:"", puntos:req.session.puntos});    
            }        
        }
    });
});

userRouter.post("/amigos/enviarSolicitud", verifyUser, (req, res) => { 
    res.status(200);

    daoUsuarios.enviarSolicitud(req.session.currentUser, req.body.user, function(err,fila){
        if (err) {
            console.log("ERROR ACEPTAR SOLICITUD");
            console.log(err);
            res.redirect("/usuarios/friends.html");
        }
        else {             
            res.redirect("/usuarios/friends.html");            
        }
    });

});

userRouter.get("/amigos/perfilAmigos/:email", verifyUser, (req, res) => { 
    res.status(200);
    var contraseña=" ";    

    daoUsuarios.bucarUsuario(req.params.email,contraseña,function(err,tipo,fila){
        if (err) {
            console.log("ERROR EN LA BUSQUEDA DE USUARIO");
            console.log(err);
        }
        else {
            daoUsuarios.cargarFotosUsuario(req.params.email, function(err,fila2){
                if (err) {
                    console.log("ERROR EN LA carga de fotos DEl USUARIO");
                    console.log(err);
                }
                else {   
                    //imagenes subidas por el usuario amigo 
                    let arrayFotos = [];
                    fila2.forEach(element => {
                        let foto={
                            email: element.email,
                            imagen: element.imagen,
                            descripcion: element.descripcion
                        }
                        arrayFotos.push(foto);
                    });
                    //imagen de perfil del usuario amigo
                    if(fila[0].imagen === null){fila[0].imagen = "vacio" }  

                    res.render("friendProfile", {fotos:arrayFotos, user:fila[0].nombreCompleto,edad:fila[0].fechaNacimiento,sexo:fila[0].sexo, puntosAmigo:fila[0].puntos, imagenAmigo:fila[0].imagen, puntos:req.session.puntos});
                }
            });            
       }
    }); 
});    

//form_añadirFoto
userRouter.post('/form_subirFoto', verifyUser, (req, res) => { //recoje el formulario de un nuevo usuario
    res.status(200);    

    daoUsuarios.subirFoto(req.session.currentUser, req.body.imagen, req.body.descripcion, function(err){
        if (err) {
            console.log("ERROR EN LA subida de foto DEl USUARIO");
            console.log(err);
            res.redirect("/usuarios/profile.html");

        }
        else {
            daoUsuarios.decrementarPuntos(req.session.currentUser, function(err){
                if (err) {
                    console.log("ERROR EN LA subida de foto DEl USUARIO");
                    console.log(err);
                    res.redirect("/usuarios/profile.html");
        
                }
                else {
                    req.session.puntos = req.session.puntos - 100;                     
                    console.log("foto del USUARIO añadida CORRECTAMENTE y puntos decrementados");
                    res.redirect("/usuarios/profile.html");
                }
            });
            
        }
    });
});

//imagenAmigo
userRouter.get("/imagenAmigo/:imagenAmigo", verifyUser, function(req, res){

    if(String(req.params.imagenAmigo) ==="vacio"){
        res.sendFile(perfilSinImagen);           
    }
    else{
        res.sendFile(perfilConImagen + "/" + req.params.imagenAmigo);                     
    } 
}); 

userRouter.get("/imagenUsuario", verifyUser, function(req, res){
    let dir;
    //if(String(req.session.imagen)==='undefined' || String(req.session.imagen)==='null' || String(req.session.imagen)===""){ 
    if(String(req.session.imagen)==="vacio"){           
        res.sendFile(perfilSinImagen);           
    }
    else{           
        res.sendFile(perfilConImagen + "/"+req.session.imagen);                 
    }
});

//************** */
userRouter.get("/logOut", (req, res) => { 
    res.status(200);
    req.session.destroy();
    res.render("login",{error:""});
});  
  
module.exports = userRouter;