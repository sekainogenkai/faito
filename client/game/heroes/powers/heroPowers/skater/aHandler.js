import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

import PowerHandler from '../../basePowerHandler';

//import WallDefense from './WallDefense';
import BallThrow from './ballThrow';
import SkateBoard from './skateBoard';
import SkateBoardBallThrow from './SkateBoardBallThrow';
// import RailMake from './railMake';

import {Buttons} from '../../../../input';


export default class BasePowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.powerBallThrow = new BallThrow(game, hero);
    this.powerSkateBoard = new SkateBoard(game, hero);
    this.powerBallSkateBoardThrow = new SkateBoardBallThrow(game, hero);

    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A:
          // if not on skateBoard
          if (!this.powerSkateBoard.object) {
            this.powerBallThrow.buttonDown(0);
            this.hero.animatePower=true;
          } else {
            this.powerBallSkateBoardThrow.buttonDown(0);
          }
          break;
        case Buttons.B:
          this.powerSkateBoard.buttonDown(0);
          this.hero.animatePower=true;
          break;
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
          // if not on skateBoard
          if (!this.powerSkateBoard.object) {
            this.powerBallThrow.buttonUp(0);
            this.hero.animatePower=false;
          } else { // on skateBoard
            this.powerBallSkateBoardThrow.buttonUp(0);
          }
        break;

        case Buttons.B:
          this.powerSkateBoard.buttonUp(0);
          this.hero.animatePower=false;
          break;

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
    this.powerSkateBoard.update();
    // must be called for all powers that remember objects
    //this.spikeRiser.deleteObjectsOnDeleteAnimation();
  }
}
