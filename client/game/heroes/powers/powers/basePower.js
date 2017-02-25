import BABYLON from 'babylonjs';

export default class BasePower {
  constructor(game, hero, power) {
    this.game = game;
    this.hero = hero;
    this.power = power;
    this.cursor = undefined;
    this.mesh = undefined;
    this._currentState = 0;
    this.spawnVec = undefined;
    this.targetVec = undefined;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
  }
  update() {
    if (this._currentState == 0) {

    } else if (this._currentState == 1) {
      // main update loop of power
      this.powerUpdate();
    } else if (this._currentState == 2) {
      this.destroy();
    }
  }

  buttonDown(i) {

  }

  buttonUp(i) {

  }

  spawn(vector1, vector2, range) {
    this.mesh.spawnAnimation = new BABYLON.Animation('spawnAnimation', 'position', 60,
                              BABYLON.Animation.ANIMATIONTYPE_VECTOR3);

    var spawnEndEvent = new BABYLON.AnimationEvent(range, function() {
      console.log('ye');
      // Switch to powerUpdate state
      this._currentState = 1;
    });

    this.mesh.spawnAnimation.addEvent(spawnEndEvent);


    this.mesh.spawnAnimationKeys = [];
    this.mesh.spawnAnimationRange = range;
    this.mesh.spawnAnimationKeys.push({
      frame: 0,
      value: vector1
    });
    this.mesh.spawnAnimationKeys.push({
      frame: range,
      value: vector2
    });
    // Set the keys
    this.mesh.spawnAnimation.setKeys(this.mesh.spawnAnimationKeys);
    this.mesh.animations.push(this.mesh.spawnAnimation);

    this.game.scene.beginAnimation(this.mesh, 0, this.mesh.spawnAnimationRange, false);

  }

  powerUpdate() {

  }

  destroy() {

  }
}
