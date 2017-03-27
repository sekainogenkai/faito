import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import PowerRemember from '../../powerRememberObjects';
import JointObject from '../../powerObjects/jointObject';
import PointCursor from '../../cursors/pointCursor';

const manaCostCreate = 2000; // mana cost of the power
const manaCostFreeze = 20;
const collisionDamage = 3; // the amount of damage it does when it collides
const chainLength = 20;
const mass = 1;

const directionVec = new BABYLON.Vector3(0, 0, -1);  // point spawn for the cursor

const fixedRotation = false;
const meshSize = 5;

/*
* Creates a box that is chained to the character
*/
export default class BlockChain extends PowerRemember {
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
        Math.max((getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) + 2,
        this.hero.mask.position.y),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:1}, this.game.scene);
      // run spawn
      // Create a new joint, needs to be a new joint
      var distJoint = new BABYLON.DistanceJoint( {maxDistance: chainLength} );
      // Create the joint object that we will use for binding the power to the hero
      //this.powerObjects.push(new JointObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(10), 0, 150, this.hero.mask, joint, mass, collisionDamage));
      this.addObject(new JointObject(this.game, this.hero,
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
      // Consume and check to see if there is enough mana
      if (!this.hero.consumeMana(manaCostCreate)){
        return;
      }
      // Create three walls that protect the player
      this.cursor = new PointCursor(this.game, this.hero,
        {direction:directionVec, distance: chainLength, fixed: true} );
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
