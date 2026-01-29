import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { createSession } from "./createSession";

export const VisitorSocket = () => {

  useEffect(() => {
    const sessionId = createSession();

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
          "202f511a032ed39dd0dd6df7c17e4034eec1e7d287a66c4d081e3f010a8b5d88",
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
      socket.off("employee:waiting-rooms");
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
