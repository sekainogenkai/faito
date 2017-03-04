import BABYLON from 'babylonjs';
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

export default class BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight=0, dropRange=0) {
    this.game = game;
    this.hero = hero;
    this.mesh = mesh;

    // setup mesh impostor
    this.mesh.physicsImpostor.onCollide = this.onPowerCollide.bind(this);

    mesh.physicsImpostor.forceUpdate();
    this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
    mesh.receiveShadows = true;

    // console.log('vectorstart', vectorStart);
    this.vectorStart = vectorStart;
    this.vectorEnd = vectorEnd;
    this.range = range;
    this.lifeSpan = lifeSpan;
    this.dropHeight = dropHeight;
    this._currentState = 0;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
    this.dropRange = dropRange?dropRange:range;

    this.spawn();
    registerBeforeSceneRender(mesh, () => this.update());
  }

  update() {
    if (this._currentState == 0) {
    } else if (this._currentState == 1) {
      // main update loop of power
      this.powerUpdate();
    } else if (this._currentState == 2) {

    }
  }

  powerUpdate() {
    if (this.lifeSpan) {
      this.lifeSpan--;
    } else {
      this._currentState = 2;
      this.destroy();
    }

  }

  spawn() {
    const spawnEndEvent = new BABYLON.AnimationEvent(this.range, () => {
      // Switch to powerUpdate state
      this.onPowerSpawn();
      this._currentState = 1;
    });

    this.moveAnimation('spawn', spawnEndEvent);
  }

  destroy() {
    this.range = this.dropRange;
    const destroyEndEvent = new BABYLON.AnimationEvent(this.range, () => {
      //console.log('End animation event!');
      this.mesh.dispose();
    });

    this.vectorStart = this.mesh.position;
    this.vectorEnd = this.mesh.position.clone();
    this.vectorEnd.y = getHeightAtCoordinates(this.groundMesh, this.vectorEnd.x, this.vectorEnd.z) - (this.dropHeight?this.dropHeight:this.mesh.getBoundingInfo().boundingBox.extendSize.y);

    //console.log('what is the range', this.dropRange);

    this.moveAnimation('destroy', destroyEndEvent);
  }

  moveAnimation(animationName, endEvent) {
    //console.log('start pos', this.vectorStart);
    //console.log('end pos', this.vectorEnd);
    var moveAnimation = new BABYLON.Animation(
      animationName, 'position', 60,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3);

    moveAnimation.addEvent(endEvent);
    var moveAnimationKeys = [
      {
        frame: 0,
        value: this.vectorStart,
      },
      {
        frame: this.range,
        value: this.vectorEnd,
      },
    ];
    // Set the keys
    moveAnimation.setKeys(moveAnimationKeys);
    this.mesh.animations = [];
    this.mesh.animations.push(moveAnimation);

    this.game.scene.beginAnimation(this.mesh, 0, this.range, false);
  }

  onPowerSpawn() {
    // Called when power is spawned
  }

  onPowerCollide(e) {
    // Called when object collides
  }
}
