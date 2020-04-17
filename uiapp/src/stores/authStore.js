import { observable, action, computed } from 'mobx'

class AuthStore {
  AuthStore() {
  }

  @observable
  busy=true;

  @observable
  isAuthenticated = false;

  @observable
  user = null;

  @action
  load() {
    this.busy=false;
  }

  @action
  async signin(email, password) {
    this.busy=true;
    try {
      const response = await fetch('/api/user/signin', {
        method: 'POST',
        headers: {
          "Content-type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
          email,
          password,
        })
      });

      if (!response.ok) {
        throw response.statusText;
      }

      this.user = await response.json()
      this.isAuthenticated=true;
    } catch (e) {
      throw 'Bad username or password.';
    } finally {
      this.busy=false;
    }
  }
}

const createAuthStore = ()=>{
  const auth=new AuthStore();
  setTimeout(()=>{
    auth.load();
  }, 1000);
  return auth;
}
export default createAuthStore;