import { Server as SocketServer } from "socket.io";
import { Server } from 'http'

export const WebSockets = (server : Server) => {
    const io = new SocketServer(server)
    return (modules : Modules) => {
        modules.set("socket.io", io);
        modules.add("admin:script", "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.4.1/socket.io.min.js")
    }
};