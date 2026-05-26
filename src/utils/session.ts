export function getSessionId(): string {
  const existing = localStorage.getItem("baked_session_id");
  if (existing) return existing;
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem("baked_session_id", id);
  return id;
}
