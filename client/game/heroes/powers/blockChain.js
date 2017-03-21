import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import JointObject from './powerObjects/jointObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const manaCost = 2000; // mana cost of the power
const collisionDamage = 10; // the amount of damage it does when it collides
const chainLength = 20;
const mass = 1;

const powerImpulseVec = new BABYLON.Vector3(0, 0, 0); // impulse applied to projectile on spawn
const directionVec = new BABYLON.Vector3(0, 0, -chainLength);  // point spawn for the cursor


const fixedRotation = false;
const meshSize = 5;

/*
* Creates a box that is chained to the character
*/
export default class BlockChain extends BasePower {
    constructor(game, hero) {
      super(game, hero);
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
      var joint = new BABYLON.DistanceJoint({
        maxDistance: chainLength
      });
      // Create the joint object that we will use for binding the power to the hero
      new JointObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(10), 0, 0, this.hero.mask, joint, mass, collisionDamage);

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
      // Create three walls that protect the player
      this.cursor = new PointCursor(this.game, this.hero, directionVec, 1, true);
    }

    buttonUp(i) {
      // Make sure a cursor is present
      if (!this.cursor){
        return;
      }

      this.createMesh();
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
