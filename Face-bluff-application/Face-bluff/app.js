"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const config = require("./config.js");



app.set("view engine", "ejs");// plantillas de las vistas
app.set("views", path.join(__dirname, "views"));
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({extended:false}));

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
 });

const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
    });
app.use(middlewareSession);

const miRouter = require("./router/routerUsuarios.js");
app.use("/usuarios", miRouter);

const miRouter2 = require("./router/routerPreguntas.js");
app.use("/preguntas", miRouter2);

app.use(function(error, request, response, next) {
    // Código 500: Internal server error
    response.status(500);
    response.render("error500", {mensaje: error.message, pila: error.stack });
});
app.use(function(req,res,next){
    res.status(404);
    res.render("error404",{url:req.url});
});


////////////
app.listen(3000, function(err) {
    if (err) {
        console.error("No se pudo inicializar el servidor: " + err.message);
    } else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});