import {io} from "socket.io-client";

const socket=io(
    "https://social-media-backend-m65i.onrender.com"
);

export default socket;