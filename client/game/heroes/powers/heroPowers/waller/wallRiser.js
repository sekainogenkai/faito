import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import ProjectileObject from '../../powerObjects/projectileObject';
import DirectionCursor from '../../cursors/directionCursor';
import {registerBeforeSceneRender} from '../../../../mesh-util';

const manaCost = 70; // mana cost of the power
const collisionDamage = 50; // the amount of damage it does when it collides

const directionVec = new BABYLON.Vector3(0, 0, 1); // direction of the cursor
const cursorSpeed = 1.9; // speed of the cursor
const fixedRotation = false;
const mass = 200;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 0); // impulse applied to projectile on spawn

const timerStart = 10;
const timerStart2 = 4;
const meshHeight = 10;

/*
* Makes a line of things fly out!
*/

export default class WallRiser extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.playerRotation = new BABYLON.Quaternion();
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshHeight/2) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshHeight/2) + 1,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(2, meshHeight, 7);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(3),
        dropHeight:50, dropRange:100, collisionCallBack:false},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:mass});

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.linearDamping = 0.8;
      mesh.physicsImpostor.physicsBody.angularDamping = 0.99;
      mesh.physicsImpostor.physicsBody.updateMassProperties();
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.playerRotation);
      }
    }

    buttonDown(i) {
      // Capture the rotation of the player at the beginning
      this.playerRotation.copyFrom(this.hero.mask.rotationQuaternion);
      this.cursor = new DirectionCursor(this.game, this.hero, {direction: directionVec, speed: cursorSpeed});
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
