import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

import PowerHandler from '../../basePowerHandler';

//import WallDefense from './WallDefense';
import BallThrow from './ballThrow';
import SkateBoard from './skateBoard';
import SkateBallThrow from './skateBallThrow';
// import RailMake from './railMake';

import {Buttons} from '../../../../input';

const boardPushStrength = 5;


export default class BasePowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.powerBallThrow = new BallThrow(game, hero);
    this.powerSkateBoard = new SkateBoard(game, hero);
    this.powerSkateBallThrow = new SkateBallThrow(game, hero);

    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];

    this.boardUP = false;
    this.boardDOWN = false;

  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A:
          if (!this.powerSkateBoard.object) { // if not on skateBoard
            this.powerBallThrow.buttonDown(0);
            this.hero.animatePower=true;
          }
          // on skateBoard
          this.boardDOWN = true;
          break;
        case Buttons.B:
          if (!this.powerSkateBoard.object) { // if not on skateboard
            this.powerSkateBoard.buttonDown(0);
            this.hero.animatePower=true;
          }
          // on skateBoard
          this.boardUP = true;
          break;

        case Buttons.LB:
          this.boardDOWN = true;
          break;

        case Buttons.X:
          if (!this.powerSkateBoard.object) { // if not on skateboard

          } else { // on skateboard
            this.powerSkateBoard.object.lifeSpan -= this.powerSkateBoard.object.lifeSpan;
          }
          this.hero.animatePower = true;
          break;

        case Buttons.Y:
          this.powerSkateBallThrow.buttonDown(0);
          this.hero.animatePower = true;
          break;
    }
  }

  buttonUp(button) {
    switch (button) {
        case Buttons.A:
          if (!this.powerSkateBoard.object) { // if not on skateboard
            this.powerBallThrow.buttonUp(0);
            this.hero.animatePower=false;
          } else { // on skateBoard
            this.boardDOWN = false;
          }
        break;

        case Buttons.B:
          if (!this.powerSkateBoard.object) { // if not on skateboard
            this.powerSkateBoard.buttonUp(0);
            this.hero.animatePower=false;
          } else { // on skateBoard
            this.boardUP = false;
          }
          break;

        case Buttons.LB:
          this.boardDOWN = false;
          break;
        case Buttons.X:
          this.hero.animatePower=false;
          break;
        case Buttons.Y:
          if (!this.powerSkateBoard.object) { // if not on skateboard

          } else { // on skateboard
            this.powerSkateBallThrow.buttonDown(0);
          }
          this.hero.animatePower = false;
          break;
    }
  }

  update() {
    this.powerBallThrow.update(!!this.powerSkateBoard.object);
    this.powerSkateBoard.update();
    // must be called for all powers that remember objects
    //this.spikeRiser.deleteObjectsOnDeleteAnimation();
    if (this.powerSkateBoard.object) {
      if (this.boardUP) {
        this.boardPush(boardPushStrength* 1);
      }
      if (this.boardDOWN) {
        this.boardPush(boardPushStrength* -1.1);
      }
    }
  }

  boardPush(push) {
    if (!this.powerSkateBoard.object) {
      return;
    }
    const boardRotationMatrix = new BABYLON.Matrix();
    this.hero.mask.rotationQuaternion.toRotationMatrix(boardRotationMatrix);
    const boardUpVector = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 1, 0), boardRotationMatrix);

    this.hero.mask.applyImpulse(boardUpVector.normalize().scale(push), this.hero.mask.position);
  }
}
