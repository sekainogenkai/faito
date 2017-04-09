import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

import PowerHandler from '../../basePowerHandler';

//import WallDefense from './WallDefense';
import BallThrow from './ballThrow';
import SkateBoard from './skateBoard';
import SkateBallThrow from './skateBallThrow';
import Ramp from './ramp';

// import RailMake from './railMake';

import {Buttons} from '../../../../input';

const boardPushStrength = 7;
const manaCostBoard = 70;


export default class BasePowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.powerBallThrow = new BallThrow(game, hero);
    this.powerSkateBoard = new SkateBoard(game, hero);
    this.powerSkateBallThrow = new SkateBallThrow(game, hero);
    this.powerRamp = new Ramp(game, hero);

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
            this.powerRamp.buttonDown(0);
          } else { // on skateboard
            this.powerSkateBoard.object.lifeSpan -= this.powerSkateBoard.object.lifeSpan;
          }
          this.hero.animatePower = true;
          break;

        case Buttons.Y:
          if (!this.powerSkateBoard.object) { // if not on skateboard

          } else { // on skateboard
            this.powerSkateBallThrow.buttonDown(this.getUpPersonVector());
          }
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
          }
          // always make this happen so it doesn't bug out
          this.boardDOWN = false;
        break;

        case Buttons.B:
          if (!this.powerSkateBoard.object) { // if not on skateboard
            this.powerSkateBoard.buttonUp(0);
            this.hero.animatePower=false;
          }
          this.boardUP = false;
          break;

        case Buttons.LB:
          this.boardDOWN = false;
          break;
        case Buttons.X:
          this.powerRamp.buttonUp(0);
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
        this.boardPushMana(boardPushStrength* 1);
      }
      if (this.boardDOWN) {
        this.boardPushMana(boardPushStrength* -1.2);
      }
    }
  }

  boardPushMana(push) {
    if (!this.powerSkateBoard.object || !this.hero.consumeMana(manaCostBoard)) {
      return;
    }
    this.boardPush(push);
  }

  boardPush(push) {
    if (!this.powerSkateBoard.object) {
      return;
    }
    const personUpVector = this.getUpPersonVector();
    this.hero.mask.applyImpulse(personUpVector.normalize().scale(push), this.hero.mask.position);
  }

  getUpPersonVector () {
    const boardRotationMatrix = new BABYLON.Matrix();
    this.hero.mask.rotationQuaternion.toRotationMatrix(boardRotationMatrix);
    const personUpVector = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 1, 0), boardRotationMatrix);
    return personUpVector;
  }
}
