const { Server } = require("socket.io");
const io=new Server(3000,{
    cors:{
        origin:["http://loaclhost:5173"]
    }
})
console.log(io)
io.on("connection",(socket)=>{
    console.log(socket)
})

exports.modules=io