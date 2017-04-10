import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import BasePowerObject from '../../powerObjects/basePowerObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 1000; // mana cost of the power
const collisionDamage = 10; // the amount of damage it does when it collides

const directionVec = new BABYLON.Vector3(0, 0, 0);  // point spawn for the cursor

const fixedRotation = true;
const meshSize = 10;

/*
* Jump Ball!
*/

export default class Power3 extends BasePower {
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
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/5),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0, friction:0.1, restitution:4}, this.game.scene);
      // run spawn
      new BasePowerObject(this.game, this.hero,
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:1, lifeSpan:secondsToTicks(1),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:collisionDamage, damageTimerMax:50});

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      // consume and check to see if there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }

      this.cursor = new PointCursor(this.game, this.hero,
        {direction:directionVec, distance:1, fixed:true});
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
