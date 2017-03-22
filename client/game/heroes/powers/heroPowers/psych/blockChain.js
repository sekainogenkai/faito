import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../base/basePower';
import JointObject from '../../powerObjects/JointObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 2000; // mana cost of the power
const collisionDamage = 10; // the amount of damage it does when it collides
const chainLength = 20;
const mass = 1;

const directionVec = new BABYLON.Vector3(0, 0, -chainLength);  // point spawn for the cursor


const fixedRotation = false;
const meshSize = 5;

/*
* Creates a box that is chained to the character
*/
export default class BlockChain extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.powerObjects = [];
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/2) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) + 2,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:1}, this.game.scene);
      // run spawn
      var distJoint = new BABYLON.DistanceJoint({
        maxDistance: chainLength
      });
      // Create the joint object that we will use for binding the power to the hero
      //this.powerObjects.push(new JointObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(10), 0, 150, this.hero.mask, joint, mass, collisionDamage));
      this.powerObjects.push(new JointObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(10),
        dropHeight:10, dropRange:150, collisionCallBack:true, damageMult:collisionDamage},
        // projectileObject values
        {target:this.hero.mask, joint:distJoint, mass:mass} ));

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      this.updateList();
      switch (i) {
        case 0: // Create the power
          // Consume and check to see if there is enough mana
          if (!this.hero.consumeMana(manaCost)){
            return;
          }
          // Create three walls that protect the player
          this.cursor = new PointCursor(this.game, this.hero,
            {direction:directionVec, distance: 1, fixed: true} );

          break;
        case 1: // Remove the joints
          this.powerObjects.forEach(function(block, i) {
            block.removeJoint();
          }, this);
          break;
        case 2: // Freeze the blocks
          this.powerObjects.forEach(function(block, i) {
            block.makeStatic();
            // Make the blocks velocities to zero
            block.mesh.physicsImpostor.physicsBody.velocity.setZero();
            block.mesh.physicsImpostor.physicsBody.angularVelocity.setZero();
          }, this);
          break;
      }

    }

    buttonUp(i) {
      // Make sure a cursor is present
      switch (i) {
        case 0: // Create the power mesh
          if (!this.cursor){
            return;
          }

          this.createMesh();
          this.cursor.destroy();
          this.cursor = undefined;
          break;
        case 2: // unfreeze objects
          this.powerObjects.forEach(function(block, i) {
            block.makeKinematic(mass);
          }, this);
          break;
      }
    }

    // Update the list of power objects we are keeping
    updateList() {
      this.powerObjects.forEach(function(block, i) {
        if (block._currentState === 2) { // if the object is in the destory phase
          this.powerObjects.splice(i, 1);
        }
      }, this);
    }
}
