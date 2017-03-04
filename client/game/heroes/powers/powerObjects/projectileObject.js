import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();
const damageMult = 10;

export default class ProjectileObject extends BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, vectorImpulse) {
    super(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange)
    this.vectorImpulse = vectorImpulse;
    this.directionVec = new BABYLON.Vector3(0, 0, 0);
    this.active = true;
    this.contactVelocity = new CANNON.Vec3();
    // Get current rotation of player
    this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
  }

  onPowerSpawn() {
    this.mesh.physicsImpostor.physicsBody.type = 1; // Make the object kinematic

    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupGround | this.game.scene.collisionGroupNormal;

    BABYLON.Vector3.TransformCoordinatesToRef(this.vectorImpulse, matrix, this.directionVec);
    this.mesh.applyImpulse(this.directionVec, this.mesh.getAbsolutePosition());
  }

  destroy() {
    this.mesh.physicsImpostor.physicsBody.type = 0; // Make the object not kinematic
    this.mesh.physicsImpostor.physicsBody.mass = 0;
    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
    super.destroy();
  }

  onPowerCollide(e) {
    if (BABYLON.Tags.HasTags(e.body) && e.body.matchesTagsQuery("hero") && e.body.parent.name != this.hero.name) {
        // e.body.parent is the hero that the object is colliding with
        this.contactVelocity.copy(this.mesh.physicsImpostor.getLinearVelocity())
        // apply the damage
        e.body.parent.takeDynamicDamage(damageMult, Math.abs(this.contactVelocity.dot(e.contact.ni)));
        this.active = false;
      }
  }
}
