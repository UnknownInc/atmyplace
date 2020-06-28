import {db} from './firebase';
import apicall from '../helpers/api';

export default class EventService {
  static async getByName(eventname) {
    const error = {code: 500, message: 'API error.'};
    try {
      const response = await apicall(`/api/event/${eventname}`);
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
  static async join(eid, data={}) {
    const error = {code: 500, message: 'API error.'};
    try {
      const response = await apicall(`/api/event/${eid}/join`,{
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (response.ok) {
        return;
      }

      error.code=response.status;
      error.message=response.statusText;

    } catch (e) {
      console.error(e);
    }
    throw error;
  }

  static async attendees(eid) {
    const error = {code: 500, message: 'API error.'};
    try {
      const response = await apicall(`/api/event/${eid}/attendees`,{
        method: 'GET',
      });
      if (response.ok) {
        return response.json();
      }

      error.code=response.status;
      error.message=response.statusText;

    } catch (e) {
      console.error(e);
    }
    throw error;

  }
  
  static async exit(eid) {
    const error = {code: 500, message: 'API error.'};
    try {
      const response = await apicall(`/api/event/${eid}/exit`);
      if (response.ok) {
        return;
      }

      error.code=response.status;
      error.message=response.statusText;

    } catch (e) {
      console.error(e);
    }
    throw error;
  }
}