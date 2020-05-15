
  export default function apicall(url, {headers, ...otherprops}={}) {
    if (!headers) headers={};
    if (window.apiAuth) {
      headers['Authorization'] = window.apiAuth.Authorization;
    }
    const ct = headers['Content-Type'];
    if (!ct) {
      headers['Content-Type']='application/json';
    }
    return fetch(url , {
      headers,
      ...otherprops
    })
  }