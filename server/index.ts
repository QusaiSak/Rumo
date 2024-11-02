
import { createServer } from "http";
import { Server, Socket } from "socket.io";
const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("send-message", (message: string) => {
        io.to(socket.id).emit("server-response", {
            message: message,
            socketId: socket.id
        });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

io.listen(5000);
