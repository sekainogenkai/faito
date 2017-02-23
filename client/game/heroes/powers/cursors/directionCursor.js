import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'

const initialDirectionVec = new BABYLON.Vector3(0, 0, 1);
const matrix = new BABYLON.Matrix();

export default class DirectionCursor extends BaseCursor {
    constructor(game, hero, speed=100) {
      super(game, hero);
      this._directionVec = new BABYLON.Vector3(0, 0, 0);
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      this.mesh.applyImpulse(initialVec.normalize().scale(speed), this.mesh.getAbsolutePosition());
      // Get current rotation of player
      this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
      BABYLON.Vector3.TransformCoordinatesToRef(initialDirectionVec, matrix, this._directionVec);
      this._directionVec.scaleInPlace(0.5);
    }

    update () {
      if (this._directionVec) {
          this.mesh.position.addInPlace(this._directionVec);
      }
    }
}
