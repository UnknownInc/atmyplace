import {db} from './firebase';
import apicall from '../helpers/api';

export default class UserService {

  static async get(uid) {
    const error = {code: 500, message: 'API error.'};
    try {
      const response = await apicall(`/api/user/${uid||'current'}`);
      if (response.ok) {
        return await response.json();
      }

      if (response.status===404) return null;

      error.code=response.status;
      error.message=response.statusText;

    } catch (e) {
      console.error(e);
    }
    throw error;
  }

  static async update(uid, values) {
    const error = {code: 500, message: 'API error.'};
    try {
      const response = await apicall(`/api/user/${uid||'current'}`,{
        method: 'POST',
        body: JSON.stringify(values)
      });
      if (response.ok) {
        return await response.json();
      }

      if (response.status===404) return null;

      error.code=response.status;
      error.message=response.statusText;

    } catch (e) {
      console.error(e);
    }
    throw error;
  }
}