import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import BasePowerObject from './powerObjects/basePowerObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';
import {registerBeforeSceneRender} from '../../mesh-util';

const directionVec = new BABYLON.Vector3(0, 0, 1);
const distance = 0;
const fixedRotation = false;
const meshSize = 6;
const timerStart = 30;
const timerStart2 = 10;

/**
* Makes a line of things fly out!
*/
export default class Power4 extends BasePower {
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
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/10),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
      mesh.receiveShadows = true;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }

      // run spawn
      new BasePowerObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(1));
    }

    buttonDown(i) {
      this.cursor = new DirectionCursor(this.game, this.hero, directionVec, 2000);
      // Add an update function to the power
      this.timer = timerStart;
      registerBeforeSceneRender(this.cursor.mesh, () => this.update());
    }

    update () {
      this.timer--;
      if (this.timer == 0) {
        this.createMesh();
        this.timer = timerStart2;
      }
    }

    buttonUp(i) {
      this.cursor.destroy();
    }
}
