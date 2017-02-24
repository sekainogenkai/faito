import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'

const initialDirectionVec = new BABYLON.Vector3(0, 0, 1);
const matrix = new BABYLON.Matrix();

export default class PointCursor extends BaseCursor {
    constructor(game, hero, direction, distance=1) {
      super(game, hero);
      this._initialDirectionVec = direction;
      this._directionVec = new BABYLON.Vector3(0, 0, 0);
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      this.mesh.applyImpulse(initialVec.normalize().scale(distance), this.mesh.getAbsolutePosition());
      // Get current rotation of player
      this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);

      BABYLON.Vector3.TransformCoordinatesToRef(this._initialDirectionVec, matrix, this._directionVec);
      this._directionVec.scaleInPlace(distance);
      // add the vector once
      this.mesh.position.addInPlace(this._directionVec);
    }

    update () {}
}
