export function validatePassword(value) {
  if (value.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[a-z]/.test(value)) {
    return "Password must include at least one lowercase letter.";
  }
  return "";
}
