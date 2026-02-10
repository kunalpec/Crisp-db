import { useState } from "react";

const TestLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Email and password required");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8000/api/company/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 🍪 receive cookies
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      setMessage("Login successful ✅");
      setPassword(""); // clear password
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/company/auth/logout",
        {
          method: "POST",
          credentials: "include", // 🍪 send cookies
        }
      );

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setMessage(data.message || "Logout failed");
        return;
      }

      setMessage("Logout successful ✅");
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
