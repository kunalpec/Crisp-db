import { useEffect } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";

export const CallSocket = () => {
  useEffect(() => {
    const sessionId = createSession();

    // connect 
    socket.connect();

    // connected
    socket.on("connect", () => {
      socket.emit("visitor:hello", { session_id: sessionId });
    });

    // verification
    socket.on("backend:verify-request", () => {
      socket.emit("frontend:verify-response", {
        session_id: sessionId,
        company_apikey: "202f511a032ed39dd0dd6df7c17e4034eec1e7d287a66c4d081e3f010a8b5d88",
        user_info: {
          browser: navigator.userAgent,
          platform: navigator.userAgentData?.platform || "unknown",
          mobile: navigator.userAgentData?.mobile || false,
        },
        current_page: window.location.pathname,
      });
    });

    // ACK from backend 
    socket.on("visitor:ready", (data) => {
      console.log("Visitor ready:", data);
      socket.emit("Visitor:message","Hi!");
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  return <div>Visitor Connected</div>;
};
