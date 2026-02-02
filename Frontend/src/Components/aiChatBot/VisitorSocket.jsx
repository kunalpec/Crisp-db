import { useEffect } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";

export const VisitorSocket = () => {
  useEffect(() => {
    const sessionId = createSession(); // create once on mount

    // connect socket
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("Visitor connected:", socket.id);

      socket.emit("visitor:hello", { session_id: sessionId });
    });

    // backend asks for verification
    socket.on("backend:verify-request", () => {
      socket.emit("frontend:verify-response", {
        session_id: sessionId,
        company_apikey:
          "0630385bfb1a193c90118d0a22769d66220c8b6916df87da7456a1e4904d40cc",
        user_info: {
          browser: navigator.userAgent,
          platform: navigator.userAgentData?.platform || "unknown",
          mobile: navigator.userAgentData?.mobile || false,
        },
        current_page: window.location.pathname,
      });
    });

    // visitor verified
    socket.on("visitor:connected", (data) => {
      console.log("Visitor verified:", data);
    });

    socket.on("verify:failed", (msg) => {
      console.error("Verify failed:", msg);
    });

    return () => {
      socket.off("connect");
      socket.off("backend:verify-request");
      socket.off("visitor:connected");
      socket.off("verify:failed");

      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h3>Visitor Connected</h3>
    </div>
  );
};
