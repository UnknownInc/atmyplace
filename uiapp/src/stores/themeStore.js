import { observable } from 'mobx'

export class ThemeStore {
  @observable
  theme = 'light'

  setTheme(newTheme) {
    this.theme = newTheme
  }
}