import BABYLON from 'babylonjs';


export default class BasePower {
  constructor(game, hero, power1, power2, power3, power4) {
    this.game = game;
    this.hero = hero;
    this.cursor = undefined;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];

  }

  buttonDown(button) {
    if (!this.powerBool) {
      return;
    }
    this._handleButton(button, true);
    switch (button) {
        case Buttons.A: this.attack1.buttonDown(0); this.animatePower=true; break;
        case Buttons.B: this.attack2.buttonDown(0); this.animatePower=true; break;
        case Buttons.X: this.attack3.buttonDown(0); this.animatePower=true; break;
        case Buttons.Y: this.attack4.buttonDown(0); this.animatePower=true; break;
    }
  }

  buttonUp(button) {
    if (!this.powerBool) {
      return;
    }
    this._handleButton(button, false);
    switch (button) {
        case Buttons.A: this.attack1.buttonUp(0); this.animatePower=false; break;
        case Buttons.B: this.attack2.buttonUp(0); this.animatePower=false; break;
        case Buttons.X: this.attack3.buttonUp(0); this.animatePower=false; break;
        case Buttons.Y: this.attack4.buttonUp(0); this.animatePower=false; break;
    }
  }

}
