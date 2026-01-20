import { API_URL } from '../config';

/**
 * Get authentication headers with access token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('access');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Fetch all meetings
 * @param {string} statusFilter - Optional filter by status (e.g., 'Planiran', 'Objavljen', etc.)
 */
export async function getSastanci(statusFilter = null) {
  const url = statusFilter 
    ? `${API_URL}/api/sastanci/?status=${statusFilter}`
    : `${API_URL}/api/sastanci/`;
    
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch meetings');
  }

  return await response.json();
}

/**
 * Get a specific meeting by ID
 * @param {number} id - Meeting ID
 */
export async function getSastanak(id) {
  const response = await fetch(`${API_URL}/api/sastanci/${id}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch meeting');
  }

  return await response.json();
}

/**
 * Create a new meeting
 * @param {object} sastanakData - Meeting data
 * @param {string} sastanakData.naslov - Title
 * @param {string} sastanakData.sazetak - Summary
 * @param {string} sastanakData.datum_vrijeme - Date and time (ISO format)
 * @param {string} sastanakData.lokacija - Location
 * @param {array} sastanakData.tocke_dnevnog_reda - Agenda items
 */
export async function createSastanak(sastanakData) {
  console.log('Creating sastanak with data:', sastanakData);
  console.log('API URL:', `${API_URL}/api/sastanci/`);
  
  const response = await fetch(`${API_URL}/api/sastanci/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(sastanakData),
  });

  console.log('Response status:', response.status);
  console.log('Response content-type:', response.headers.get('content-type'));

  const responseText = await response.text();
  console.log('Response text:', responseText);

  let data;
  try {
    data = JSON.parse(responseText);
    console.log('Parsed response data:', data);
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    data = { error: 'Server returned invalid response', details: responseText };
  }
  
  return { ok: response.ok, data };
}

/**
 * Update an existing meeting
 * @param {number} id - Meeting ID
 * @param {object} sastanakData - Updated meeting data
 */
export async function updateSastanak(id, sastanakData) {
  const response = await fetch(`${API_URL}/api/sastanci/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(sastanakData),
  });

  const responseText = await response.text();
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error('Non-JSON response:', responseText);
    data = { error: 'Server returned invalid response', details: responseText };
  }
  
  return { ok: response.ok, data };
}

/**
 * Delete a meeting
 * @param {number} id - Meeting ID
 */
export async function deleteSastanak(id) {
  const response = await fetch(`${API_URL}/api/sastanci/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return { ok: response.ok };
}

/**
 * Confirm attendance for a meeting
 * @param {number} id - Meeting ID
 * @param {boolean} potvrda - Confirmation status (true/false)
 */
export async function potvrdaSastanak(id, potvrda = true) {
  const response = await fetch(`${API_URL}/api/sastanci/${id}/potvrda/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ potvrda }),
  });

  const data = await response.json();
  return { ok: response.ok, data };
}

/**
 * Change meeting status
 * @param {number} id - Meeting ID
 * @param {string} status - New status ('Planiran', 'Objavljen', 'Obavljen', 'Arhiviran')
 */
export async function changeSastanakStatus(id, status) {
  const response = await fetch(`${API_URL}/api/sastanci/${id}/status/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const responseText = await response.text();
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error('Failed to parse response:', responseText);
    data = { error: 'Server returned invalid response', details: responseText };
  }
  
  return { ok: response.ok, data };
}
