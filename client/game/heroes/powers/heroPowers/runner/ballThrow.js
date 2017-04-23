import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import ProjectileObject from '../../powerObjects/projectileObject';
import PointCursor from '../../cursors/pointCursor';

const manaCost = 800; // mana cost of the power
const collisionDamage = 3; // the amount of damage it does when it collides

//const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = 10; // cursor offset
const directionVec = new BABYLON.Vector3(0, 0, 1); // position of the cursor

const fixedRotation = true;
const meshSize = 3;
const powerImpulseVec = new BABYLON.Vector3(0, -1, 300); // impulse applied to projectile on spawn

/**
Shoots out a projectile at the enemy
**/
export default class BallThrow extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        Math.max((getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + 1,
        this.hero.mask.position.y + 2),
        this.cursor.mesh.position.z
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
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:15, lifeSpan:secondsToTicks(1),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:collisionDamage},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:5} );


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

      this.cursor = new PointCursor(this.game, this.hero, {direction:directionVec, distance:distance, fixed:true});
    }

    buttonUp(i) {
      // Check for cursor presence;
      if (!this.cursor){
        return;
      }

      this.createMesh();
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
