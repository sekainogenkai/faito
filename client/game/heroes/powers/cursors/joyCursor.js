import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'
import {rotateFromHero} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();

export default class JoyCursor extends BaseCursor {
    constructor(game, hero, options={speed:1, direction:null, distance:1}) {
      super(game, hero);
      this._speed = options.speed;
      this._updatePositionVec = new BABYLON.Vector3(0, 0, 0);
      // var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      // Get current rotation of player
      // this.mesh.applyImpulse(initialVec.normalize().scale(300), this.mesh.getAbsolutePosition());
      this.joy = new BABYLON.Vector2(0, 0);
      this.hero.setJoyTarget(this);

      // Use starting point starting out at direciton from player
      // Get current rotation of player
      let direction = options.direction;
      let distance = options.distance;
      if (direction) {
        this.mesh.position.addInPlace(rotateFromHero(this.hero, direction, distance));
      }
    }

    update () {
      this._updatePositionVec.x = this.joy.x;
      this._updatePositionVec.z = this.joy.y;
      this._updatePositionVec.normalize().scaleInPlace(this._speed);
      this.mesh.position.addInPlace(this._updatePositionVec);

      super.update();
    }

    joyChanged(joy) {
      this.joy = joy;
    }

    destroy() {
      this.mesh.dispose();
      this.hero.setJoyTarget();
    }

}
