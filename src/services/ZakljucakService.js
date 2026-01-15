import { API_URL } from '../config';

function getAuthHeaders() {
  const token = localStorage.getItem('access');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function createZakljucci(zakljucciData) {
  const response = await fetch(`${API_URL}/api/zakljucci/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(zakljucciData),
  });

  const responseText = await response.text();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    data = { error: 'Server returned invalid response', details: responseText };
  }
  
  return { ok: response.ok, data };
}

export async function getZakljucciBySastanak(sastanakId) {
  const response = await fetch(`${API_URL}/api/zakljucci/sastanak/${sastanakId}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conclusions');
  }

  return await response.json();
}

export async function getZakljucciByTocka(tockaId) {
  const response = await fetch(`${API_URL}/api/zakljucci/tocka/${tockaId}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conclusions for agenda item');
  }

  return await response.json();
}
