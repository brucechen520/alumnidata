import axios from 'axios';

// Common same-origin session-cookie transport for the Vue entries.
export const http = axios.create({
  baseURL: '/ee/api/',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
});

export async function ready() {
  try { await http.get('api_auth_me.php'); } catch (error) {
    if (!error.response || error.response.status !== 401) throw error;
  }
}

export function errorMessage(error, fallback) {
  return error.response && error.response.data && error.response.data.message || fallback;
}
