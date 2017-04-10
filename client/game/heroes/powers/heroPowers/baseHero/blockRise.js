import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../base/basePower';
import BasePowerObject from '../../powerObjects/basePowerObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 500; // mana cost of the power
const collisionDamage = 500; // the amount of damage it does when it collides

const directionVec = new BABYLON.Vector3(0, 0, 1); // position of the cursor
const distance = 10; // cursor scalar

const fixedRotation = false;
const meshSize = 10;

/*
* Makes a block using joy cursor
*/
export default class Power1 extends BasePower {
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
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) - 2,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', meshSize, this.game.scene);
      console.log(mesh.material);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      new BasePowerObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 100, secondsToTicks(1), 0, 0, true, collisionDamage);
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

      this.cursor = new JoyCursor(this.game, this.hero, {speed:20});
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
