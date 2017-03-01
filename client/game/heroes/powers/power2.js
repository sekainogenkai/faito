import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import ProjectileObject from './powerObjects/projectileObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1);
const distance = 10;
const fixedRotation = true;
const meshSize = 2;
const lifeSpan = secondsToTicks(50);
const powerImpulseVec = new BABYLON.Vector3(0, 10, 30)

/**
Shoots out a porjectile at the enemy
**/

export default class Power2 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize) + 2,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      mesh.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {mass:0, friction:0.1, restitution:0.9});
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
      mesh.receiveShadows = true;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }

      // run spawn
      new ProjectileObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(5), powerImpulseVec);
    }

    buttonDown(i) {
      this.cursor = new PointCursor(this.game, this.hero, cursorDirectionVec, distance, true);
    }

    buttonUp(i) {
      this.createMesh();
      // this.game.scene.registerBeforeRender(() => this.update()); // TODO this does something or nothing?
      if (!fixedRotation) {
        this.setRotation(this.hero.mask.rotationQuaternion);
      }
      this.cursor.destroy();
    }

    setRotation(rotation) {
      // Set the mesh rotation to the rotation
      this.mesh.rotationQuaternion.copyFrom(rotation)
    }
}