import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject';

export default class BasePower {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;
    this.cursor = undefined;
    this.mesh = undefined;
    this.vectorStart = undefined;
    this.vectorEnd = undefined;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
  }

  createBasePowerObject(mesh, vectorStart, vectorEnd, range) {
    console.log(vectorStart);
    this.newPowerObject = new BasePowerObject(this.game, this.hero, mesh, vectorStart, vectorEnd, range);
  }

  update() {};

  buttonDown(i) {

  }

  buttonUp(i) {

  }

  destroy() {

  }
}
