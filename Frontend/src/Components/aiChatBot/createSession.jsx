export const createSession = () => {
  let sessionId = localStorage.getItem("visitor_session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("visitor_session_id", sessionId);
  }

  return sessionId; // ✅ RETURN VALUE
};
