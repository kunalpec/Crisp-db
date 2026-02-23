import VisitorChatRoom from "./AIChatBot/VisitorChatRoom";
import { useEffect, useState } from "react";

const OtherWidgetChat = () => {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("apiKey");
    setApiKey(key);
  }, []);

  if (!apiKey) return null;

  return (
    <div style={{ height: "100vh", margin: 0 }}>
      <VisitorChatRoom apiKey={apiKey} />
    </div>
  );
};

export default OtherWidgetChat;