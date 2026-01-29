import { useState } from "react";

const TestLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🍪 receive cookies
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      setMessage("Login successful");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include", // 🍪 send cookies
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        setMessage(data.message || "Logout failed");
        return;
      }

      setMessage("Logout successful");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleLogin}>Login</button>

      <br />
      <br />

      <button onClick={handleLogout}>Logout</button>

      <p>{message}</p>
    </div>
  );
};

export default TestLogin;
