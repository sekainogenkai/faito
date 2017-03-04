import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import BasePowerObject from './powerObjects/basePowerObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';
import {registerBeforeSceneRender} from '../../mesh-util';

const manaCost = 50;

const directionVec = new BABYLON.Vector3(0, 0, 1);
const cursorSpeed = 1.9;
const fixedRotation = false;
const timerStart = 7;
const timerStart2 = 2;
const meshHeight = 20;

/**
* Makes a line of things fly out!
*/
export default class Power4 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.playerRotation = new BABYLON.Quaternion();
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshHeight/2) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshHeight/10),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(2, meshHeight, 3);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
      mesh.receiveShadows = true;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.playerRotation);
      }

      // run spawn
      new BasePowerObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(3), 50);
    }

    buttonDown(i) {
      // Capture the rotation of the player at the beginning
      this.playerRotation.copyFrom(this.hero.mask.rotationQuaternion);
      this.cursor = new DirectionCursor(this.game, this.hero, directionVec, cursorSpeed);
      // Add an update function to the power
      this.timer = timerStart;
      registerBeforeSceneRender(this.cursor.mesh, () => this.update());
    }

    update () {
      this.timer--;
      if (this.timer == 0) {
        if (!this.hero.consumeMana(manaCost)){
          this.cursor.destroy();
        } else {
          this.createMesh();
          this.timer = timerStart2;
        }
      }
    }

    buttonUp(i) {
      this.cursor.destroy();
    }
}
