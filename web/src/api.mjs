import { errorMessage } from './i18n.mjs';
let csrf = '';
export const setCsrf = value => {
  csrf = value || '';
};
export async function api(path, {
  method = 'GET',
  body,
  token = csrf
} = {}) {
  let response;
  try {
    response = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: method === 'GET' ? {} : {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw Object.assign(new Error(errorMessage({})), {
      code: 'request_failed'
    });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Object.assign(new Error(errorMessage(data)), {
      status: response.status,
      code: data.code,
      detail: typeof data.detail === 'string' ? data.detail : undefined
    });
    throw error;
  }
  if (data.csrf) setCsrf(data.csrf);
  return data;
}
export function request(action, revision, token) {
  const team = window.location.pathname.split('/').filter(Boolean)[1];
  return api('/teams/' + encodeURIComponent(team) + (action ? '/actions' : '/board'), action ? {
    method: 'POST',
    body: {
      revision,
      action
    },
    token
  } : {});
}
