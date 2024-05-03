const express = require('express')
const app = express()
const bodyP = require('body-parser')
const compiler = require('compilex')
const options  = {stats:true}
const http= require('http')    
const { Server } = require('socket.io')


const server= http.createServer(app);
const io = new Server(server);


compiler.init(options)
let users = [];
let id;
let name;
io.on('connection', (socket)=>{
    console.log('A client connected' + socket.id);
    id = socket.id;
    
    socket.on('message',(message)=>{
        socket.broadcast.emit('recieved', message);
    })
    socket.on('output',(message)=>{
        socket.broadcast.emit('newOutput', message);
    })
})
app.use(bodyP.json())
app.use(express.static('./'))
app.use("/codemirror", express.static("./codemirror"))

app.get('/',(req,res)=>{
    compiler.flush(()=>{
        console.log("deleted");
    })
    res.sendFile('index.html')
})

app.post('/addUser',(req,res)=>{
    name = req.body.name;
    console.log(name);
    const user = {
        username : name,
        _id : id
    }
    users.push(user);
    res.send(JSON.stringify(users));
})


app.post("/compile", (req,res)=>{
    var code = req.body.code;
    var input = req.body.input;
    var lang = req.body.lang;
  try{
    if(lang=="Cpp"){
        if(!input){
            var envData = { OS : "windows" , cmd : "g++", options:{timeout:10000}}; // (uses g++ command to compile )
            compiler.compileCPP(envData , code , function (data) {
                if(data.output){res.send(data);}
                else{res.send({output: "error"})}
            });
        }else{
            var envData = { OS : "windows" , cmd : "g++",  options:{timeout:10000}}; // (uses g++ command to compile )
            compiler.compileCPPWithInput(envData , code , input , function (data) {
                if(data.output){res.send(data);}
                else{res.send({output: "error"})}
            });
        }
    }else if(lang == "Java"){
        if(!input){
            var envData = { OS : "windows"}; 
            compiler.compileJava( envData , code , function(data){
                if(data.output){res.send(data);}
                else{res.send({output: "error"})}
            });    
        }else{
            var envData = { OS : "windows"}; 
            compiler.compileJavaWithInput( envData , code , input ,  function(data){
                if(data.output){res.send(data);}
                else{res.send({output: "error"})}
            });
        }
    }else if(lang=="Python"){
        if(!input){
            var envData = { OS : "windows"}; 
            compiler.compilePython( envData , code , function(data){
                if(data.output){res.send(data);}
                else{res.send({output: "error"})}
            });  
        }else{
            var envData = { OS : "windows"}; 
            compiler.compilePythonWithInput( envData , code , input ,  function(data){
                if(data.output){res.send(data);}
                else{res.send({output: "error"})}        
            });
        }
    }
  }catch(error){
    console.log("erorr")
  }
})



server.listen(3002)
