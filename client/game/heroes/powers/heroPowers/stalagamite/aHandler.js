import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

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

    this.powerCloserBool = false;
    this.powerFartherBool = false;

  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A:
          this.hero.slowDown = 2.5;
          this.spikeThrow.buttonDown(0);
          this.hero.animatePower=true;
          break;
        case Buttons.B: this.spikeRiser.buttonDown(0); this.hero.animatePower=true; break;
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
        case Buttons.A:
          this.hero.slowDown = 1;
          this.spikeThrow.buttonUp(0);
          this.hero.animatePower=false;
          break;
        case Buttons.B: this.spikeRiser.buttonUp(0); this.hero.animatePower=false; break;

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

  powerMove(scale) {
      // Move all spikes on the ground closer to me
      for (let object of this.spikeRiser.objects) {
        //console.log('updating mesh position');
        // figure out vector from mesh to player
        let vec = this.moveObjectRelativePlayer(object, scale);
        object.mesh.position.x += vec.x;
        object.mesh.position.z += vec.y;
      }

      for (let object of this.spikeThrow.objects) {
        if (object._currentState == 0) {
          let vec = this.moveObjectRelativePlayer(object, -scale);
          object.vectorEnd.x += vec.x;
          object.vectorEnd.z += vec.y;
        }
      }
  }

  moveObjectRelativePlayer(object, scale) {
    let x = this.hero.mask.position.x - object.mesh.position.x;
    let z = this.hero.mask.position.z - object.mesh.position.z;
    let vec = new BABYLON.Vector2(x,z);
    return vec.normalize().scaleInPlace(scale);
  }

  update() {
    // must be called for all powers that remember objects
    this.spikeRiser.deleteObjectsOnDeleteAnimation();
    this.spikeThrow.deleteObjectsOnDeleteAnimation();
    if (this.powerCloserBool) {
      this.powerMove(.5);
    }
    if (this.powerFartherBool) {
      this.powerMove(-.5);
    }
  }
}
