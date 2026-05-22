const KEY = "nf_user_id";

export function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
