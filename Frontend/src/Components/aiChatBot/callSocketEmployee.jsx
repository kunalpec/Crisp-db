import { useEffect } from "react";
import { socket } from "../../socket";

export const CallEmployeeSocket = () => {
  useEffect(() => {


    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Employee connected:", socket.id);
    });

    // receive waiting visitors

    return () => {
      socket.off("connect");
      socket.off("visitors:waiting");
      socket.disconnect();
    };
  }, []);

  return <div>Employee Dashboard Connected</div>;
};
