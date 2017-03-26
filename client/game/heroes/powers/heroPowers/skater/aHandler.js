import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

import PowerHandler from '../../basePowerHandler';

//import WallDefense from './WallDefense';
import BallThrow from './ballThrow';
import SkateBoard from './skateBoard';
// import RailMake from './railMake';

import {Buttons} from '../../../../input';

const boardPushStrength = 5;


export default class BasePowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.powerBallThrow = new BallThrow(game, hero);
    this.powerSkateBoard = new SkateBoard(game, hero);

    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
    this.boardPushNum = 0;

  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A:
          // if not on skateBoard
          if (!this.powerSkateBoard.object) {
            this.powerBallThrow.buttonDown(0);
            this.hero.animatePower=true;
          }
          // on skateBoard
          this.boardPushNum = -1;
          break;
        case Buttons.B:
          if (!this.powerSkateBoard.object) {
            this.powerSkateBoard.buttonDown(0);
            this.hero.animatePower=true;
          }
          // on skateBoard
          this.boardPushNum = 1;
          break;

        case Buttons.LB:
          this.boardPushNum = -1;
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
            this.boardPushNum = 0;
          }
        break;

        case Buttons.B:
          if (!this.powerSkateBoard.object) {
            this.powerSkateBoard.buttonUp(0);
            this.hero.animatePower=false;
          } else { // on skateBoard
            this.boardPushNum = 0;
          }
          break;

        case Buttons.LB:
          this.boardPushNum = 0;
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
    this.powerBallThrow.update(!!this.powerSkateBoard.object);
    this.powerSkateBoard.update();
    // must be called for all powers that remember objects
    //this.spikeRiser.deleteObjectsOnDeleteAnimation();
    if (this.powerSkateBoard.object && this.boardPushNum != 0) {
      this.boardPush(boardPushStrength* this.boardPushNum)
    }
  }

  boardPush(push) {
    if (!this.powerSkateBoard.object) {
      return;
    }
    const boardRotationMatrix = new BABYLON.Matrix();
    this.powerSkateBoard.object.mesh.rotationQuaternion.toRotationMatrix(boardRotationMatrix);
    const boardUpVector = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 1, 0), boardRotationMatrix);

    this.hero.mask.applyImpulse(boardUpVector.normalize().scale(push), this.hero.mask.position);
  }
}
