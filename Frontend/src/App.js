import { useRoutes } from "react-router-dom";

import { publicRoutes } from "./routing/publicRoutes";
import { companyRoutes } from "./routing/companyRoutes";
import { adminRoutes } from "./routing/adminRoutes";

function App() {

  const allRoutes = useRoutes([
    ...publicRoutes,
    ...companyRoutes,
    ...adminRoutes,
  ]);

  return (
    <div className="App">
      {allRoutes}
    </div>
  );
}

export default App;
