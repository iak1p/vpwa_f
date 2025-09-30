import { boot } from "quasar/wrappers";
import { connectSocket } from "src/lib/socket";

export default boot(() => {
  const socket = connectSocket();

  socket.on("connect", () => {
    const raw = localStorage.getItem("user");
    const userId = raw ? JSON.parse(raw).id : null;
    if (userId) socket.emit("auth:hello", userId);
  });
});
