export async function createUserByAdmin(user, token) {
    const response = await fetch('http://localhost:8000/api/create-user-admin/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }
  
export async function refreshAccessToken(refresh) {
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    const data = await response.json();
    return { ok: response.ok, data };
}
  