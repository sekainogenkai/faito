import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'

const matrix = new BABYLON.Matrix();

export default class DirectionCursor extends BaseCursor {
    constructor(game, hero, direction, speed=100) {
      super(game, hero);
      this._initialDirectionVec = direction;
      this._directionVec = new BABYLON.Vector3(0, 0, 0);
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      this.mesh.applyImpulse(initialVec.normalize().scale(speed), this.mesh.getAbsolutePosition());
      // Get current rotation of player
      this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
      BABYLON.Vector3.TransformCoordinatesToRef(this._initialDirectionVec, matrix, this._directionVec);
      this._directionVec.scaleInPlace(0.5);
    }

    update () {
      if (this._directionVec) {
          this.mesh.position.addInPlace(this._directionVec);
      }
    }
}
