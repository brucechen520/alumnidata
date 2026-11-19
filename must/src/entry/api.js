import { http } from '../shared/http';

export const entryApi = {
  login: (username, password) => http.post('api_auth_login.php', { username, password }),
  emailExists: email => http.get('api_entry_email.php', { params: { email } }),
  register: data => http.post('api_entry_register.php', data),
  requestReset: email => http.post('api_entry_reset_request.php', { email }),
  reset: (password, passwordConfirm) => http.post('api_entry_reset.php', { password, passwordConfirm })
};
