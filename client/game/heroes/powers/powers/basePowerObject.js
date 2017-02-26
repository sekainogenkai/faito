import BABYLON from 'babylonjs';


export default class BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range) {
    this.game = game;
    this.hero = hero;
    this.mesh = mesh;
    console.log('vectorstart', vectorStart);
    this.vectorStart = vectorStart;
    this.vectorEnd = vectorEnd;
    this.range = range;
    this._currentState = 0;
    this.spawn();
  }

  update() {
    if (this._currentState == 0) {
    } else if (this._currentState == 1) {
      // main update loop of power
      this.powerUpdate();
    } else if (this._currentState == 2) {

    }
  }

  spawn() {
    var spawnEndEvent = new BABYLON.AnimationEvent(this.range, function() {
      console.log('End animation event');
      // Switch to powerUpdate state
      this._currentState = 1;
    }.bind(this));

    this.moveAnimation(spawnEndEvent);
  }

  destroy() {
        this.destroyEndEvent = new BABYLON.AnimationEvent(this.range, function() {
          this.mesh.dispose();
        }.bind(this));
  }

  moveAnimation(endEvent) {
    console.log('start pos', this.vectorStart);
    console.log('end pos', this.vectorEnd);
    this.moveAnimation = new BABYLON.Animation('moveAnimation', 'position', 60,
                              BABYLON.Animation.ANIMATIONTYPE_VECTOR3);

    this.moveAnimation.addEvent(endEvent);
    this.moveAnimationKeys = [];
    this.moveAnimationKeys.push({
      frame: 0,
      value: this.vectorStart
    });
    this.moveAnimationKeys.push({
      frame: this.range,
      value: this.vectorEnd
    });
    // Set the keys
    this.moveAnimation.setKeys(this.moveAnimationKeys);
    this.mesh.animations.push(this.moveAnimation);

    this.game.scene.beginAnimation(this.mesh, 0, this.range, false);
  }
}
