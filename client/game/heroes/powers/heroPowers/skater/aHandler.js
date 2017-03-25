import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

import PowerHandler from '../../basePowerHandler';

//import WallDefense from './WallDefense';
import BallThrow from './ballThrow';
// import RampMake from './rampMake';
// import RailMake from './railMake';

import {Buttons} from '../../../../input';


export default class BasePowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.powerBallThrow = new BallThrow(game, hero);

    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A: this.powerBallThrow.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.B: this.powerBallThrow.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.X:
          this.powerCloserBool = true;
          this.hero.animatePower = true;
          break;

        case Buttons.Y:
          this.powerFartherBool = true;
          this.hero.animatePower = true;
          break;
    }
  }

  buttonUp(button) {
    switch (button) {
        case Buttons.A: this.powerBallThrow.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.B: this.powerBallThrow.buttonUp(0); this.hero.animatePower=false; break;

        case Buttons.X:
          this.powerCloserBool = false;
          this.hero.animatePower=false;
          break;
        case Buttons.Y:
          this.powerFartherBool = false;
          this.hero.animatePower = false;
          break;
    }
  }

  update() {
    this.powerBallThrow.update();
    // must be called for all powers that remember objects
    //this.spikeRiser.deleteObjectsOnDeleteAnimation();
  }
}
