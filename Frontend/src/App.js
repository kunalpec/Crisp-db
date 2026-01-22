import { Route, Routes } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { routes } from "./routing/routing";

function App() {
  const [data, setData] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/") // Change to your backend API endpoint
      .then((response) => { setData(response.data) 

        console.log(response)
      })
      .catch((error) => console.error("Error fetching data:", error));

    console.log("hello",data);
  }, []);
  return (
    <div className="App">
      {data}
       <Routes>
        {routes.map((route,index)=>(
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </div>
  );
}

export default App;
