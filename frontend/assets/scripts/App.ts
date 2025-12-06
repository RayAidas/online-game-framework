
import * as managers from "./manager/indexManager";

export default class App {
  static get eventManager() {
    return managers.EventManager.getInstance();
  }
}

window.App = App || {};
