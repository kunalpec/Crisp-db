import { io } from "socket.io-client";
import { SOCKET_URL } from "./config/api.config";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"], // Add polling as fallback
});
