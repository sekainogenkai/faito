import BABYLON from 'babylonjs';

import {Buttons} from '../../../../input';

import RockPsych from './blockChain';
import JumpBall from '../baseHero/jumpBall';

export default class PowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;
    //this.cursor = undefined;
    //this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];

    this.power1 = new JumpBall(game, hero);
    this.power2 = this.power3 = this.power4 = new RockPsych(game, hero);
  }

  buttonDown(button) {
    console.log('handling button down');
    //this._handleButton(button, true);
    switch (button) {
        case Buttons.A: this.power1.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.B: this.power2.buttonDown(2); this.hero.animatePower=true; break;
        case Buttons.X: this.power3.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.Y: this.power4.buttonDown(1); this.hero.animatePower=true; break;
    }
  }


  buttonUp(button) {
    console.log('handling button up');
    //this._handleButton(button, false);
    switch (button) {
        case Buttons.A: this.power1.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.B: this.power2.buttonUp(2); this.hero.animatePower=false; break;
        case Buttons.X: this.power3.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.Y: this.power4.buttonUp(1); this.hero.animatePower=false; break;
    }
  }
}
