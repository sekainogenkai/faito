import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

// Make the snake.
import SnakeMaker from './snakeMaker';
import {Buttons} from '../../../../input';

const snakeSpeed = 30;


export default class PowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    //this.spikeThrow = new SpikeThrow(game, hero);
    this.snakeMaker = new SnakeMaker(game, hero);

  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A:
          this.hero.moveBool = false;
          this.moveSnakeBool = true;
          this.moveSnake();
          this.hero.animatePower=true;

          break;
        case Buttons.B:

        break;
        case Buttons.X:

          break;

        case Buttons.Y:
          this.snakeMaker.buttonDown(0);
          this.moveSnakeBool = false;
          this.hero.animatePower = false;
          break;
    }
  }

  moveSnake() {
    // move snake if it exists
    console.log(this.snakeMaker.objects[0]);
    //console.log(this.snakeMaker.objects[0].lifeSpan);
    if (this.snakeMaker.objects[0] && this.snakeMaker.objects[0].lifeSpan > 0) {
      console.log('moving the snake');
      console.log(this.hero.Input.AXIS_X);
      let movementVector = new BABYLON.Vector3(this.hero.Input.AXIS_X,0,this.hero.Input.AXIS_Y);
      let normalizedMovementVector = movementVector.clone().normalize();
      movementVector = normalizedMovementVector.scale(snakeSpeed);
      console.log(this.snakeMaker.objects[0]);
      console.log('movementVector', movementVector);
      this.snakeMaker.objects[0].mesh.applyImpulse(movementVector, this.snakeMaker.objects[0].mesh.position);
    }
  }

  buttonUp(button) {
    switch (button) {
        case Buttons.A:
          this.hero.moveBool = true;

          break;
        case Buttons.B:

          break;

        case Buttons.X:

          break;
        case Buttons.Y:
          this.snakeMaker.buttonUp(0);

          break;
    }
  }

  update() {
    if (this.moveSnakeBool) {
      this.moveSnake();
    }
    // must be called for all powers that remember objects
    this.snakeMaker.deleteObjectsOnDeleteAnimation();
  }
}
