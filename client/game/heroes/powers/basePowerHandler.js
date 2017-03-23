import BABYLON from 'babylonjs';


import {Buttons} from '../../input';


export default class BasePowerHandler {
  constructor(game, hero, power1, power2, power3, power4) {
    this.game = game;
    this.hero = hero;

    this.power1 = new power1(game, hero);
    this.power2 = new power2(game, hero);
    this.power3 = new power3(game, hero);
    this.power4 = new power4(game, hero);

  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A: this.power1.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.B: this.power2.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.X: this.power3.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.Y: this.power4.buttonDown(0); this.hero.animatePower=true; break;
    }
  }


  buttonUp(button) {
    switch (button) {
        case Buttons.A: this.power1.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.B: this.power2.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.X: this.power3.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.Y: this.power4.buttonUp(0); this.hero.animatePower=false; break;
    }
  }

}
