import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './base/basePower';
import ProjectileObject from './powerObjects/projectileObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const manaCost = 800; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides

//const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = -10; // cursor offset

const fixedRotation = true;
const meshSize = 1.5;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 120); // impulse applied to projectile on spawn

/**
Shoots out a projectile at the enemy
**/
export default class Power2 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh (cursor) {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, cursor.mesh.position.x, cursor.mesh.position.z)) - (meshSize) - 2,
        cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        cursor.mesh.position.x,
        Math.max((getHeightAtCoordinates(this.groundMesh, cursor.mesh.position.x, cursor.mesh.position.z)) + 2,
        this.hero.mask.position.y + 5),
        cursor.mesh.position.z
      );
      // console.log('y position', this.hero.mask.position.y);

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0, friction:2, restitution:0.01}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:15, lifeSpan:secondsToTicks(5),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:10},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:50} );


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

      this.cursors = [];
      for (let i = 0; i < 6; i++) {
        this.cursors.push(new PointCursor(this.game, this.hero,
          {direction: new BABYLON.Vector3(i*2/10-.5, 0, 1 - Math.abs(i*2/10-.5)), distance: 10, fixed: false}));
      }
    }

    buttonUp(i) {
      // Check for cursor presence
      // console.log(this.cursors);
      if (this.cursors.length <= 0){
        return;
      }
      for (let cursor of this.cursors) {
        this.createMesh(cursor);
      }
      // this.game.scene.registerBeforeRender(() => this.update()); // TODO this does something or nothing?
      if (!fixedRotation) {
        this.mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
      for (let cursor of this.cursors) {
        cursor.destroy();
      }
      this.cursors = [];
    }
}
