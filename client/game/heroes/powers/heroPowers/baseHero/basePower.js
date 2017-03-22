import BABYLON from 'babylonjs';

export default class BasePower {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;
    this.cursor = undefined;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
  }

  buttonDown(i) {
  }

  buttonUp(i) {
  }
}
