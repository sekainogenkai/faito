import BABYLON from 'babylonjs';

import PowerHandler from '../../basePowerHandler';

//import WallDefense from './WallDefense';
import SpikeRiser from './spikeRiser';
import SpikeThrow from './spikeThrow';

import {Buttons} from '../../../../input';


export default class BasePowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.spikeThrow = new SpikeThrow(game, hero);
    this.spikeRiser = new SpikeRiser(game, hero);

  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A: this.spikeThrow.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.B: this.spikeRiser.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.X:
          this.spikeRiser.deleteObjectsOnDeleteAnimation();
          for (let object of this.spikeRiser.objects) {
            console.log('updating mesh position');
            object.mesh.position.x += 3;
          }
          this.hero.animatePower=true;
          break;

        case Buttons.Y:
          this.hero.animatePower=true;
          break;
    }
  }


  buttonUp(button) {
    switch (button) {
        case Buttons.A: this.spikeThrow.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.B: this.spikeRiser.buttonUp(0); this.hero.animatePower=false; break;

        case Buttons.X:
          this.hero.animatePower=false;
          break;
        case Buttons.Y:
          this.hero.animatePower=false;
          break;
    }
  }

  update() {

  }
}
