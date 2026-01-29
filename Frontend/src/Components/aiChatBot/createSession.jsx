export const createSession = () => {
  const data = JSON.parse(localStorage.getItem("visitor_session"));

  if (!data || Date.now() > data.expiresAt) {
    const session = {
      id: crypto.randomUUID(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 min
    };
    localStorage.setItem("visitor_session", JSON.stringify(session));
    return session.id;
  }

  return data.id;
};

