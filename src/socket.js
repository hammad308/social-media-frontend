import {io} from "socket.io-client";

const socket=io(
    "https://social-media-frontend-ochre-five.vercel.app"
);

export default socket;