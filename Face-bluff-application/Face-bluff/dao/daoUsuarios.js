class dao {
    constructor(host, nombreUsuario, constraseña, nombre) {
        this.Host = host;
        this.NombreUsuario = nombreUsuario;
        this.Constraseña = constraseña;
        this.Nombre = nombre;

        const mysql = require("mysql");
        this.pool = mysql.createPool({
            host: this.Host,
            user: this.NombreUsuario,
            password: this.Constraseña,
            database: this.Nombre
        });
    }

    insertarUsuario(usuario,callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "INSERT INTO usuarios(email, contraseña, nombreCompleto,fechaNacimiento,sexo,imagen, puntos) VALUES (?,?,?,?,?,?,0)", [usuario.email,usuario.contraseña,usuario.nombreCompleto,usuario.fechaNacimiento,usuario.sexo, usuario.imagen]
                    ,function(err, fila) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            usuario.id=  fila.id;
                            callback(null);
                        }
                    }
                );
            }
            }
        );
    }
    
    enviarSolicitud(miEmail, emailUsuario, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "INSERT INTO amigos(idUser, idUser2, sonAmigos) VALUES (?, ?, ?)",
                    [miEmail, emailUsuario, false]
                    ,function(err, fila) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null);
                        }
                    }
                );
            }
            }
        );
    }

    modificarUsuario(usuario,callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "UPDATE usuarios SET contraseña=?,nombreCompleto=?,fechaNacimiento=?,sexo=?, imagen=? WHERE email=?", [usuario.contraseña,usuario.nombreCompleto,usuario.fechaNacimiento,usuario.sexo,usuario.imagen,usuario.email]
                    ,function(err, fila) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            usuario.id=  fila.id;
                            callback(null);
                        }
                    }
                );
            }
            }
        );
    }

    bucarUsuario(email,contraseña,callback){
        
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "SELECT * FROM usuarios WHERE usuarios.email=?", [email]
                    ,function(err, fila) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            if(fila.length>0){
                                if(contraseña==fila[0].contraseña){
                                    callback(null,true,fila);
                                
                                }
                                else{
                                    callback(null,false,fila);
                                }
                            }
                            else {callback(null,false,fila);
                             }
                            
                        }
                    }
                );
            }
            }
        );
       
    }

    bucarAmigos(email,callback){
        
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "SELECT U.nombreCompleto,U.email, U.imagen FROM amigos A,usuarios U WHERE A.idUser=? and sonAmigos=1 and  A.idUser2=U.email", [email]
                    ,function(err, filas) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {                            
                            callback(null,filas);                            
                        }
                    }
                );
            }
            }
        );
       
    }
    
    cargarFotosUsuario(email,callback){        
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "SELECT * FROM fotos WHERE email=?", [email]
                    ,function(err, filas) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {                            
                            callback(null,filas);                            
                        }
                    }
                );
            }
            }
        );       
    }

    bucarSolicitudes(email,callback){
        
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "SELECT U.nombreCompleto,U.email,U.imagen FROM amigos A,usuarios U WHERE A.idUser2=? and sonAmigos=0 and  A.idUser=U.email", [email]
                    ,function(err, filas) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {                            
                            callback(null,filas);                            
                        }
                    }
                );
            }
            }
        );
       
    }
    
    decrementarPuntos(email, callback){
        this.pool.getConnection(function(err, con) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                con.query(
                    "UPDATE usuarios SET puntos = puntos - 100 WHERE email=?", [email]
                    ,function(err) {
                        con.release();
                        if (err) { 
                             callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null);
                        }                        
                    }
                );
            }
        });       
    }
    
    subirFoto(email,foto,descripcion,callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "INSERT INTO fotos(email, imagen, descripcion) VALUES(?,?,?)", [email,foto,descripcion]
                    ,function(err, filas) {
                        connection.release();
                        if (err) { 
                            callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null,filas);                            
                        }
                    }
                );
            }
        });       
    }
    
    rechazarSolicitud(emailSolicitante, emailMio, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "DELETE FROM amigos WHERE idUser=? && idUser2=?", [emailSolicitante, emailMio]
                    ,function(err, filas) {
                        connection.release();
                        if (err) { 
                            callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null,filas);                            
                        }
                    }
                );
            }
        });       
    }

    aceptarSolicitud(email1,email2,callback){

        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "UPDATE amigos SET sonAmigos=1 WHERE idUser=? && idUser2=?", [email1,email2]
                    ,function(err, filas) {
                        if (err) {
                            

                            callback("Error de consulta:"+err);
                        }
                        else {
                            connection.query(
                                "INSERT INTO amigos(idUser, idUser2, sonAmigos) VALUES (?, ?,?)", [email2,email1,true]
                                ,function(err, filas) {
                                    connection.release();
                                    if (err) {                                       
                                        callback("Error de consulta:"+err);
                                    }
                                    else {                                        
                                        callback(null,filas);                                        
                                    }
                                }
                            );
                            
                        }
                    }
                );
            }
            }
        );
       
    }

    bucarPerfiles(miEmail,nombreBuscar,callback){
        
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                connection.query(
                    "SELECT email,nombreCompleto FROM usuarios WHERE\
                    email!=? && nombreCompleto LIKE \"%" + nombreBuscar + "%\""+";", [miEmail]
                    ,function(err, filas) {
                        connection.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {                            
                            callback(null,filas);                            
                        }
                    }
                );
            }
            }
        );
       
    }

    getUserImageName(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err);
            }
            else{
                connection.query("SELECT imagen FROM usuarios WHERE email = ?",[email],
                (err, fila) => {
                    connection.release();
                    if (err) { 
                        callback(err);
                    }
                    else{                  
                        callback(null, fila[0].imagen);                        
                    }                    
                });
            }
        });
    }


}
module.exports=dao;