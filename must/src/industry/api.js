import qs from 'qs';
import { http, errorMessage } from '../shared/http';
import { dialog } from '../shared/dialog';

let identity = Promise.resolve(null);
let currentPath = () => '';
const publicLists = {
  '/products': ['api_product_get.php'],
  '/JobQuery': ['api_vacancy_get.php', 'api_project_get.php'],
  '/FindMan': ['api_member_get.php'],
  '/workSearching': ['api_member_get.php']
};

export function setRequestContext(identityPromise, getPath) {
  identity = identityPromise;
  currentPath = getPath;
}

function endpoint(url) {
  return url.replace(/^\/?ee\/api\//, '');
}

export function request(method, url, data, config) {
  const name = endpoint(url);
  const publicList = (publicLists[currentPath()] || []).includes(name);
  const result = method === 'get' ? http.get(name, data) : http.post(name, data, config);
  return result.then(response => response.data).catch(async error => {
    const status = error.response && error.response.status;
    if (status === 401) {
      let user;
      if (name !== 'api_user.php') {
        try { user = await identity; } catch (_) { user = null; }
      }
      if (!(publicList && user && user.name === '訪客')) {
        window.location.href = '/ee/index.php';
      }
    } else if (status === 403) {
      await dialog.alert(errorMessage(error, '權限不足'));
    }
    throw error;
  });
}

export function getData(url, config) { return request('get', url, config); }
export function getUserData(url) { return getData(url); }
export function postData(url, data) {
  return request('post', url, qs.stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function logout() {
  return http.post('api_auth_logout.php').then(() => {
    window.location.href = '/ee/index.php';
  }).catch(() => {
    window.location.href = '/ee/logout.php';
  });
}
