import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import PowerRemember from '../../powerRememberObjects';
import JointObject from '../../powerObjects/jointObject';
import ProjectileObject from '../../powerObjects/projectileObject';
import PointCursor from '../../cursors/pointCursor';

const manaCostCreate = 4000; // mana cost of the power
const collisionDamage = 1; // the amount of damage it does when it collides
const mass = 1;
const maxItems = 100;

const directionVec = new BABYLON.Vector3(0, 0, 1);  // point spawn for the cursor

const fixedRotation = false;
const meshSize = 4;
const duration = 60;
const snakeLength = 20;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 200); // impulse applied to projectile on spawn

/*
* Creates a box that is chained to the character
*/
export default class SnakeMaker extends PowerRemember {
    constructor(game, hero) {
      super(game, hero, maxItems);
    }

    createMesh () {
      for (let i = 0; i<snakeLength; i++) {

        // Set the spawn vector
        const vectorStart = new BABYLON.Vector3(
          this.cursor.mesh.position.x,
          (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/2) - 2,
          this.cursor.mesh.position.z
        );

        // Set the target vector
        const vectorEnd = new BABYLON.Vector3(
          this.cursor.mesh.position.x,
          Math.max((getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) + 2 + i*meshSize,
          this.hero.mask.position.y),
          this.cursor.mesh.position.z
        );

        // Create the mesh
        const mesh = new BABYLON.Mesh.CreateSphere('mesh', 5, meshSize-(.1*i), this.game.scene);


        mesh.position.copyFrom(vectorStart);
        BABYLON.Tags.EnableFor(mesh);
        BABYLON.Tags.AddTagsTo(mesh, "checkJump");
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:1}, this.game.scene);
        // run spawn

        if (i!=0) {
          // Create a new joint, needs to be a new joint
          var distJoint = new BABYLON.DistanceJoint( {maxDistance: meshSize-(.1*i) } );
          // Create the joint object that we will use for binding the power to the hero
          //console.log('physics impostor', this.objects[i-1], 'length', this.objects.length);
          this.addObject(new JointObject(this.game, this.hero,
          // basePowerObject values
          {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(duration),
          dropHeight:10, dropRange:5, collisionCallBack:true, damageMult:collisionDamage},
          // projectileObject values
          {target: this.objects[i-1].mesh, joint: distJoint, mass: mass} ));
        } else {
          this.addObject(new ProjectileObject(this.game, this.hero,
            // basePowerObject values
            {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(duration),
            dropHeight:10, dropRange:5, collisionCallBack:true, damageMult:collisionDamage},
            {vectorImpulse:powerImpulseVec, mass:10, usePlayerRot:true}));
        }

        mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
        mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;

        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana or see if we have max amount of objects
      // only make a snake if there are no snake objects
      //console.log('objects length', this.objects.length, this.objects.length != 0);
      if (this.objects.length != 0 || this.powerIsFull() || !this.hero.consumeMana(manaCostCreate)){
        return;
      }
      // Create three walls that protect the player
      this.cursor = new PointCursor(this.game, this.hero,
        {direction:directionVec, distance: 8, fixed: true} );
    }

    buttonUp(i) {
      // Make sure a cursor is present
      if (!this.cursor) {
        return;
      }

      this.createMesh();
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
