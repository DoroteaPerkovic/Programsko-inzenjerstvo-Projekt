import { API_URL } from './config';

export async function loginWithUsernameAndPassword(usernameOrEmail, password) {
  const response = await fetch(`${API_URL}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: usernameOrEmail,
      password: password,
    }),
  });

  const data = await response.json();
  return { ok: response.ok, data };
}