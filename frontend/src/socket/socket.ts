import { io } from "socket.io-client";

const socket = io("https://workease-backend-zwsf.onrender.com");

export default socket;