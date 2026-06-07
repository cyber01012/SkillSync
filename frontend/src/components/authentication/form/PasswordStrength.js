export function getPasswordStrength(password) {
  if (!password || password.length < 6) {
    return { score: 0, label: "Too short", color: "#ef4444" }; // red
  }

  let points = 0;
  if (/[a-z]/.test(password)) points++;
  if (/[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;
  if (password.length >= 10) points++;

  let score = 1;
  if (points >= 4) score = 4;
  else if (points === 3) score = 3;
  else if (points === 2) score = 2;
  else score = 1;

  const map = {
    1: { label: "Weak", color: "#ef4444" },
    2: { label: "Fair", color: "#f59e0b" },
    3: { label: "Strong", color: "#10b981" },
    4: { label: "Very strong", color: "#22c55e" }
  };

  return { score, label: map[score].label, color: map[score].color };
}
