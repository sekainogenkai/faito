import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import PowerRememberObjects from '../../powerRememberObjects';
import ProjectileObject from '../../powerObjects/heroRotationCopy';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 400; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides
const mass = 10;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 200); // impulse applied to projectile on spawn

const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = -10; // cursor offset

const fixedRotation = false;
const meshHeight = 3;
const meshWidth = 1;


/**
Shoots out a projectile at the enemy
**/
export default class SpikeThrow extends PowerRememberObjects {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshHeight) - 5,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        (this.hero.mask.position.x*2 + this.cursor.mesh.position.x)/3,
        Math.max(
          this.hero.mask.position.y + 15,
          (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshHeight)
        ),
        (this.hero.mask.position.z*2 + this.cursor.mesh.position.z)/3
      );
      // console.log('y position', this.hero.mask.position.y);

      // Create the mesh
      const mesh = BABYLON.MeshBuilder.CreateCylinder('cone', {diameterTop: 0, tessellation: 10}, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshWidth, meshHeight, meshWidth);
      //mesh.

      BABYLON.Tags.EnableFor(mesh);
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.CylinderImpostor,
        {mass: 0, friction:0.0, restitution:0.0}, this.game.scene);
      // run spawn
      this.addObject(new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:250, lifeSpan:secondsToTicks(2),
        dropHeight:5, dropRange:100, collisionCallBack:true, damageMult:10},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:mass, usePlayerRot:true} ));

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
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
