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
    this.power2 = new RockPsych(game, hero);
  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A: this.power1.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.B: this.power2.buttonDown(2); this.hero.animatePower=true; break;
        case Buttons.X: this.power2.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.Y: this.power2.buttonDown(1); this.hero.animatePower=true; break;
    }
  }


  buttonUp(button) {
    switch (button) {
        case Buttons.A: this.power1.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.B: this.power2.buttonUp(2); this.hero.animatePower=false; break;
        case Buttons.X: this.power2.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.Y: this.power2.buttonUp(1); this.hero.animatePower=false; break;
    }
  }
}
