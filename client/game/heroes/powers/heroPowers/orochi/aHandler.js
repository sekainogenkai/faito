import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

// Make the snake.
import SnakeMaker from './snakeMaker';

import {Buttons} from '../../../../input';


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
          this.snakeMaker.buttonDown(0);
          break;
        case Buttons.B:

        break;
        case Buttons.X:

          break;

        case Buttons.Y:

          break;
    }
  }


  buttonUp(button) {
    switch (button) {
        case Buttons.A:
          this.snakeMaker.buttonUp(0);
          break;
        case Buttons.B:

          break;

        case Buttons.X:

          break;
        case Buttons.Y:

          break;
    }
  }

  update() {
    // must be called for all powers that remember objects
    this.snakeMaker.deleteObjectsOnDeleteAnimation();
  }
}
