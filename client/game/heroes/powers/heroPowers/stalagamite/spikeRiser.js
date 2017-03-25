import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import PowerRemember from '../../powerRememberObjects';
import BasePowerObject from '../../powerObjects/basePowerObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';
import {registerBeforeSceneRender} from '../../../../mesh-util';

const manaCost = 200; // mana cost of the power
const collisionDamage = 50; // the amount of damage it does when it collides

const directionVec = new BABYLON.Vector3(0, 0, 1); // direction of the cursor
const cursorSpeed = 1.9; // speed of the cursor

const timerStart = 1;
const timerStart2 = 2;
const meshHeight = 3;
const meshWidth = 1;
const meshScaling = new BABYLON.Vector3(meshWidth, meshHeight, meshWidth);

/*
* Makes a line of things fly out!
*/
export default class Power5 extends PowerRemember {
    constructor(game, hero) {
      super(game, hero);
      this.playerRotation = new BABYLON.Quaternion();
      this.meshHeight = meshHeight;
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
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshHeight),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = BABYLON.MeshBuilder.CreateCylinder('cone', {diameterTop: 0, tessellation: 10}, this.game.scene);//new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = meshScaling;

      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");

      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.CylinderImpostor, {mass:0, friction:0.01, restitution:0.9}, this.game.scene);



      // run spawn
      this.addObject(new BasePowerObject(this.game, this.hero,
      {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(5),
        dropHeight:10, dropRange:50, collisionCallBack:true, damageMult:collisionDamage, damageTimerMax:120, shadow:false}));

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;


    }

    buttonDown(i) {
      // Capture the rotation of the player at the beginning
      this.playerRotation.copyFrom(this.hero.mask.rotationQuaternion);
      this.cursor = new JoyCursor(this.game, this.hero, {speed: 1, direction: new BABYLON.Vector3(0,0,10), distance:10});
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
