import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../base/basePower';
import ProjectileObject from '../../powerObjects/projectileObject';
import PointCursor from '../../cursors/pointCursor';

const manaCost = 2000; // mana cost of the power
const collisionDamage = 500; // the amount of damage it does when it collides
const mass = 500;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 0); // impulse applied to projectile on spawn
const directionVec = new BABYLON.Vector3(0, 0, 1); // position of the cursor
const distance = 18; // cursor scalar
const fixedRotation = false;
const meshSize = 10;

/*
* Makes a block using joy cursor
*/
export default class HeavyBall extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/2) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) + 2,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:15, lifeSpan:secondsToTicks(5),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:10},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:mass} );

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana
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
