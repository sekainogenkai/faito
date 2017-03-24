import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import ProjectileObject from '../../powerObjects/heroRotationCopy';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 800; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides
const mass = 100;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 1700); // impulse applied to projectile on spawn

const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = -10; // cursor offset

const fixedRotation = true;
const meshHeight = 3;
const meshWidth = 1;


/**
Shoots out a projectile at the enemy
**/
export default class SpikeThrow extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.objects = [];
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshHeight) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        (this.hero.mask.position.x*2 + this.cursor.mesh.position.x)/3,
        Math.max(
          this.hero.mask.position.y + 15,
          (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshHeight)
        ),
        (this.hero.mask.position.z*2 + this.cursor.mesh.position.z)/3
      );
      // console.log('y position', this.hero.mask.position.y);

      // Create the mesh
      const mesh = BABYLON.MeshBuilder.CreateCylinder('cone', {diameterTop: 0, tessellation: 10}, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshWidth, meshHeight, meshWidth);
      mesh.rotation.x = Math.PI/2;
      //mesh.

      BABYLON.Tags.EnableFor(mesh);
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.CylinderImpostor,
        {mass: 0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:100, lifeSpan:secondsToTicks(5),
        dropHeight:10, dropRange:1000, collisionCallBack:true, damageMult:10},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:mass, usePlayerRot:true} );

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
      this.cursor = new PointCursor(this.game, this.hero,
        {direction: cursorDirectionVec, distance: distance, fixed: true});
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
