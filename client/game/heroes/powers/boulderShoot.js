import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './base/basePower';
import ProjectileObject from './powerObjects/projectileObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const manaCost = 800; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides
const mass = 100;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 3000); // impulse applied to projectile on spawn

const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = -10; // cursor offset

const fixedRotation = true;
const meshSize = 8;


/**
Shoots out a projectile at the enemy
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
        this.hero.mask.position.y + 15,
        this.cursor.mesh.position.z
      );
      // console.log('y position', this.hero.mask.position.y);

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(5), 0, 0, powerImpulseVec, mass, collisionDamage);
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      // Consume and check is there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }
      this.cursor = new PointCursor(this.game, this.hero, cursorDirectionVec, distance, true);
    }

    buttonUp(i) {
      // Check for cursor presence
      if (!this.cursor){
        return;
      }
      this.createMesh();
      // this.game.scene.registerBeforeRender(() => this.update()); // TODO this does something or nothing?
      if (!fixedRotation) {
        this.mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
