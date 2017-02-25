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

    }
  }

  buttonDown(i) {

  }

  buttonUp(i) {

  }

  spawn(vector1, vector2, range) {
    this.mesh.spawnEndEvent = new BABYLON.AnimationEvent(range, function() {
      console.log('End animation event');
      // Switch to powerUpdate state
      this._currentState = 1;
    }.bind(this));

    this.mesh.destroyEndEvent = new BABYLON.AnimationEvent(range, function() {
      this.mesh.dispose();
    }).bind(this);

    this.moveAnimation(vector1, vector2, range, spawnEndEvent);
  }

  powerUpdate() {

  }

  destroy() {

  }

  moveAnimation(vector1, vector2, range, endEvent) {
    this.mesh.moveAnimation = new BABYLON.Animation('moveAnimation', 'position', 60,
                              BABYLON.Animation.ANIMATIONTYPE_VECTOR3);

    this.mesh.moveAnimation.addEvent(endEvent);
    this.mesh.moveAnimationKeys = [];
    this.mesh.moveAnimationRange = range;
    this.mesh.moveAnimationKeys.push({
      frame: 0,
      value: vector1
    });
    this.mesh.moveAnimationKeys.push({
      frame: range,
      value: vector2
    });
    // Set the keys
    this.mesh.moveAnimation.setKeys(this.mesh.moveAnimationKeys);
    this.mesh.animations.push(this.mesh.moveAnimation);

    this.game.scene.beginAnimation(this.mesh, 0, this.mesh.moveAnimationRange, false);
  }

}
