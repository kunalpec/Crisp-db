import { useRoutes, useLocation } from "react-router-dom";

import { publicRoutes } from "./routing/publicRoutes";
import { companyRoutes } from "./routing/companyRoutes";
import { adminRoutes } from "./routing/adminRoutes";

import ChatWidget from "./Components/ChatWidget"; // ✅ Import

function App() {
  const allRoutes = useRoutes([
    ...publicRoutes,
    ...companyRoutes,
    ...adminRoutes,
  ]);

  const location = useLocation();

  // ✅ Only show on Home Page
  const showChatWidget = location.pathname === "/";

  return (
    <div className="App">
      {allRoutes}

      {/* ✅ ChatWidget only on homepage */}
      {showChatWidget && <ChatWidget />}
    </div>
  );
}

export default App;
