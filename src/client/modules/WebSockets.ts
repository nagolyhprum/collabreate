import { Server as SocketServer } from "socket.io";
import { Server } from 'http'

export const WebSockets = (server : Server) => {
    const io = new SocketServer(server)
    return (dependencies : Dependencies) => {
        dependencies.set("socket.io", io);
        dependencies.add("admin:script", "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.4.1/socket.io.min.js")
    }
};