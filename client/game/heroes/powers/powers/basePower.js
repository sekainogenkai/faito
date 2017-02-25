import BABYLON from 'babylonjs';


export default class BasePower {
  constructor(game, hero, power) {
    this.game = game;
    this.hero = hero;
    this.power = power;
    this.cursor = undefined;
    this._currentState = 0;
    this.game.scene.registerBeforeRender(() => this.update());
  }
  update() {
    if (this._currentState == 0) {
      this.spawn();
    } else if (this._currentState == 1) {
      // main update loop of power
      this.powerUpdate();
    } else if (this._currentState == 2) {
      this.destroy();
    }
  }

  buttonDown(i) {

  }

  buttonUp(i) {

  }

  spawn() {

  }

  poweUpdate() {

  }

  destroy() {

  }
}
