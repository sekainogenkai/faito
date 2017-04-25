import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks, rotateFromHero} from '../../powerUtils/mainUtils';
import {registerBeforeSceneRender} from '../../../../mesh-util';
import BasePower from '../../powerRememberObjects';
import JointObject from '../../powerObjects/jointObject';
import PointCursor from '../../cursors/pointCursor';

const manaCostCreate = 50; // mana cost of the power
const manaCostHold = 20; // mana cost of the power
const chargeIncrement = 10;
const maxCharge = 1000;
const collisionDamage = 5; // the amount of damage it does when it collides
const jointLength = 5;
const mass = 1;
const maxItems = 3;

const directionVec = new BABYLON.Vector3(0, 0, 1);  // point spawn for the cursor

const fixedRotation = false;
const meshSize = 2;

/*
* Creates a box that is chained to the character
*/
export default class RunCharge extends BasePower {
    constructor(game, hero) {
      super(game, hero, maxItems);
      this.vectorImpulse = new BABYLON.Vector3(0, 0, 0);
      this.wallObject = undefined;
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
        Math.max((getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) + 2,
        this.hero.mask.position.y),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshSize*1.5, meshSize*1.5, 2);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:1, linearDamping: 0.0001}, this.game.scene);
      // run spawn
      // Create a new joint, needs to be a new joint
      var distJoint = new BABYLON.DistanceJoint( {maxDistance: jointLength} );
      // Create the joint object that we will use for binding the power to the hero
      //this.powerObjects.push(new JointObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(10), 0, 150, this.hero.mask, joint, mass, collisionDamage));
      this.wallObject = new JointObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(5),
        dropHeight:10, dropRange:150, collisionCallBack:true, damageMult:collisionDamage},
        // projectileObject values
        {target:this.hero.mask, joint:distJoint, mass:mass} );

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana or see if we have max amount of objects
      if (!this.hero.consumeMana(manaCostCreate)){
        return;
      }
      // stop the hero from moving
      this.hero.slowDown = 100;
      // Create three walls that protect the player
      this.cursor = new PointCursor(this.game, this.hero,
        {direction:directionVec, distance: jointLength, fixed: true} );

      this.createMesh();
      registerBeforeSceneRender(this.cursor.mesh, () => this.update());
    }

    update() {
      if (this.vectorImpulse.z < maxCharge && this.hero.consumeMana(manaCostHold)){
        this.vectorImpulse.z += chargeIncrement;
      }
    }

    buttonUp(i) {
      // Make sure a cursor is present
      if (!this.cursor || !this.wallObject) {
        return;
      }
      // reset his movement speed
      this.hero.slowDown = 1;
      // Apply the force to the wallObject
      console.log(this.vectorImpulse);
      let directionVec = rotateFromHero(this.hero, this.vectorImpulse);
      this.wallObject.mesh.applyImpulse(directionVec, this.wallObject.mesh.position);

      this.cursor.destroy();
      this.cursor = undefined;
      this.wallObject = undefined;
    }
}
