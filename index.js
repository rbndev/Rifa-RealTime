var express = require('express'), 
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    mysql = require('mysql');
const clc = require('cli-color');
var porta = process.env.PORT || 3000;
http.listen(porta, () => {
  console.log(`Rifa Online!\n`);
  console.log(`Servidor rodando na porta 3000.`);
});
var numeros = {};


// CONEXAO DB
let connConfig = {
    host: 'locahost',
    user: 'root',
    password: '',
    database: 'rifa'
  }
  let con = mysql.createConnection(connConfig);
  let connect = function (err) {
    if (err) throw err;
    console.log(clc.greenBright("  Conexão com o banco de dados OK!!!"));
  };
  let connectionError = function (err) {
    con = mysql.createConnection(connConfig);
    con.connect(connect);
    con.on('error', connectionError);
  };
  con.connect(connect);
  con.on('error', connectionError); // FIM CONEXAO


//listagem de numeros
con.query("SELECT * FROM num", function (erro, resultado){

  resultado.forEach( (element,index, array) => {
    numeros[element.num] = {num: element.num, nome: element.nome,cpf: element.cpf, tel: element.tel, status: element.status};
  });

  console.log(numeros);
});


io.on('connection', (socket) => {
    // console.log(`novo socket: ${socket.id}`);
    io.emit('listagem', numeros);

    socket.on('disconnect', () => {
      // console.log(`socket disconectado ${socket.id}.`);
    });
    
    
    socket.on('cadastrar', (cadastro) =>{
      console.log(cadastro);
      
      con.query("INSERT INTO num(num, nome, cpf, tel, status) VALUES(?,?,?,?,?)", [cadastro.num, cadastro.nome, cadastro.cpf, cadastro.tel, "closed"], function(err, result){
        cadastro.status = 'closed';
        io.emit('add', cadastro);
        numeros[cadastro.num] = cadastro;
        console.log(numeros);
      });
      
      
    });
    
    socket.on('comprar', (num) =>{
        console.log(`Comprou: ${num}`);
    });
    
    socket.on('reservar', (cadastro) =>{
      con.query("INSERT INTO num(num, nome, cpf, tel, status) VALUES(?,?,?,?,?)", [cadastro.num, cadastro.nome, cadastro.cpf, cadastro.tel, "reserved"], function(err, result){
        cadastro.status = 'reserved';
        io.emit('reservado', cadastro);
        numeros[cadastro.num] = cadastro;
        console.log(numeros);
      });        
    });

    socket.on('selecionar', (num) =>{
      con.query("SELECT * FROM num WHERE num = ?", [num], function (erro, resultado){
        if (resultado.length == 1){
          socket.emit('actions', resultado[0].status, resultado[0].nome, num, resultado[0].cpf, resultado[0].tel);
          console.log(`${num} ${resultado[0].status}`);
        } else {
          socket.emit('actions', 'open', '', num);
          console.log(`${num} disponivel.`);  
        }
      });
    });

    socket.on('aprovar', (num) =>{
      con.query("UPDATE num SET status = ? WHERE num = ?", ["closed", num], function (erro, resultado){
        console.log(resultado);
        io.emit('aprovado', num);
      });
    });

    socket.on('deletar', (num) =>{
      console.log(`deletando o numero ${num}`);
      con.query("DELETE FROM num WHERE num = ?", [num], function (erro, resultado){
        socket.emit('alertas', `deletado`);
        delete numeros[num];
        console.log(numeros);
        io.emit('deletado', num);
      });

    });

});


// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
  
app.use(express.static('public'));

app.use('/cdn', express.static(__dirname + '/public'));
