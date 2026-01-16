import bcrypt from "bcryptjs";

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
};

const users = new Map<string, UserRecord>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  const value = normalizeEmail(email || "");
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
}

export function validatePassword(password: string) {
  return String(password || "").length >= 8;
}

export async function createUser(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (users.has(normalized)) {
    return null;
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const user: UserRecord = {
    id,
    email: normalized,
    passwordHash
  };

  users.set(normalized, user);
  return user;
}

export async function verifyUser(
  email: string,
  password: string
) {
  const normalized = normalizeEmail(email);
  const user = users.get(normalized);
  if (!user) {
    return null;
  }
  const ok = await bcrypt.compare(
    String(password),
    user.passwordHash
  );
  if (!ok) {
    return null;
  }
  return user;
}

