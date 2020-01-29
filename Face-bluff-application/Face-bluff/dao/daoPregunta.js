class daoPregunta {
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
    
    //try guessed
    friendsAnswersG(email, idPregunta, callback){
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query("SELECT u.email, u.imagen, u.nombreCompleto, a.adivinado\
                           FROM usuarios u, adivinadas a\
                           WHERE a.email1=? AND a.idPregunta=? AND u.email=a.email2",
                           [email, idPregunta], function(err, fila){
                    con.release();                    
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, fila);
                    }             
                });
            }   
        });
    }
    //********************************************************** */
    //SELECT u.nombreCompleto, u.imagen, r.respuesta FROM( amigos a inner JOIN usuarios u on a.idUser2=u.email AND a.idUser="j" inner JOIN respuesta r on u.email = r.email) LEFT JOIN adivinadas adv on u.email=adv.email2 AND adv.email1 = "j" WHERE r.idPregunta = 0 AND a.sonAmigos = 1
    //SELECT u.nombreCompleto, u.imagen, r.respuesta 
//FROM (amigos a inner JOIN usuarios u on a.idUser2=u.email inner JOIN respuesta r on u.email = r.email) LEFT join adivinadas adv on adv.email1 = "j" 
//WHERE r.idPregunta = 0 AND a.sonAmigos = 1 AND ADV.email2 = null and a.idUser="j"
//SELECT u.nombreCompleto, u.imagen, r.respuesta, u.email FROM (amigos a inner JOIN usuarios u on a.idUser2=u.email inner JOIN respuesta r on u.email = r.email) full outer join adivinadas adv on adv.email1 = "j"WHERE r.idPregunta = 0 AND a.sonAmigos = 1 and a.idUser="j" and adv.email2 is null and adv.idPregunta = 0
    friendsAnswersNG(email, idPregunta, callback){
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query("SELECT u.nombreCompleto, u.imagen, r.respuesta, u.email \
                 FROM amigos a inner JOIN usuarios u on a.idUser2=u.email inner JOIN respuesta r on u.email = r.email\
                    WHERE r.idPregunta = ? AND a.sonAmigos = true and a.idUser=?",
                           [idPregunta,email], function(err, fila){
                    con.release();                    
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, fila);
                    }             
                });
            }   
        });
    }
    
    //busca si el usuario ha respondido a una pregunta
    searchQuestionAnswered(email, idPregunta, callback){
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query("SELECT * FROM respuesta WHERE email=? AND idPregunta=?", [email, idPregunta], function(err, fila){
                    con.release();                    
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, fila);
                    }             
                });
            }   
        });
    }

    showQuestions(callback) {
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query("SELECT id, pregunta FROM preguntas", [], function(err, fila){
                    con.release();                    
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, fila);
                    }             
                });
            }   
        });
    }
    showTheAnswers(idPregunta, callback) {
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query("SELECT respuestas FROM preguntas WHERE id=?", [idPregunta], function(err, fila){
                    con.release();                    
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, fila);
                    }             
                });
            }   
        });
    }

    
    insertPonitsGessedQuestion(email, callback){
        this.pool.getConnection(function(err, con) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                con.query(
                    "UPDATE usuarios SET puntos = puntos + 50 WHERE email=?", [email]
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
    
    insertGuessing(email1, email2, idPregunta, adivinado, callback) {
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query(
                    "INSERT INTO adivinadas( email1, email2, idPregunta, adivinado) VALUES (?, ?, ?, ?)",
                    [email1, email2, idPregunta, adivinado]
                    ,function(err, fila) {
                        con.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null, fila);
                        }
                    }
                );
            }   
        });
    }
    insertQuestions(question, answers, callback) {
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query(
                    "INSERT INTO preguntas( pregunta, respuestas) VALUES (?, ?)",
                    [question, answers]
                    ,function(err, fila) {
                        con.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null, fila);
                        }
                    }
                );
            }   
        });
    }
    searchQuestion(idPregunta,callback){
        this.pool.getConnection(function(err, con) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                con.query(
                    "SELECT * FROM preguntas WHERE id=?", [idPregunta]
                    ,function(err, fila) {
                        con.release();
                        if (err) {
                            callback("Error de consulta:"+err);
                        }
                        else {
                            callback(null,fila);  
                        }
                    }
                );
            }
            }
        );
    }
    //insertAnswer
    insertAnswer(email, idPregunta, respuesta, callback) {
        this.pool.getConnection((err, con) => {
            if (err) {
                callback(err);
            }
            else {
                con.query(
                    "INSERT INTO respuesta(email, idPregunta, respuesta) VALUES (?, ?, ?)",
                    [email, idPregunta, respuesta]
                    ,function(err, fila) {
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
    //insertNewAnswerIntoQuestion
    insertNewAnswerIntoQuestion(id, respuestaNueva,callback){
        this.pool.getConnection(function(err, con) {
            if (err) {
                callback("Error de conexion:"+err);
            }
            else {
                con.query(
                    "UPDATE preguntas SET respuestas=? WHERE id=?", [respuestaNueva,id]
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

}
module.exports=daoPregunta;