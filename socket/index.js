const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

// 创建服务
const io = new Server(httpServer, {
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:5173",
	},
});

let userList = [];
io.on("connection", (socket) => {
	console.log(io);
	// 统计登录用户
	checkUser(socket);
	// 群体发送在线用户数量
	io.emit("online", {
		userList,
	});
	// 接送客户端发送过来的信息
	socket.on("sendMessage", ({ fromUsername, tragerid, msg }) => {
		// 获取要发送给目标用户的sockets
		const tragerSocket = io.sockets.sockets.get(tragerid);
		const tragerUser = userList.find((user) => user.id === tragerid);
		// 发送信息给另一个用户
		tragerSocket.emit("recive", {
			fromUsername: fromUsername,
			toUsername: tragerUser.username,
			msg: msg,
			time: new Date().getTime(),
		});
	});
	// 下线用户更新用户列表
	socket.on("disconnect", (reason) => {
		userList = userList.filter((user) => user.id !== socket.id);
		io.emit("online", {
			userList,
		});
	});
});

// 获取在线用户列表
function checkUser(socket) {
	const username = socket.handshake.query.username;
	if (!username) return;

	const userInfo = userList.find((user) => user.username === username);
	if (userInfo) {
		userInfo.id = socket.id;
	} else {
		userList.push({
			username: socket.handshake.query.username,
			id: socket.id,
		});
	}
}

httpServer.listen(3000);
