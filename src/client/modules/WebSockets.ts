import { Server as SocketServer } from "socket.io";
import { Server } from 'http'

export const WebSockets = (server : Server) => {
    const io = new SocketServer(server)
    return (dependencies : IDependencies) => {
        dependencies.set("socket.io", io);
        // "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.4.1/socket.io.min.js"
        dependencies.add("admin:script", "/socket.io/socket.io.min.js")
    }
};