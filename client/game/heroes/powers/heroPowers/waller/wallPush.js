import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks, rotateFromHero} from '../../powerUtils/mainUtils';
import BasePower from '../../base/basePower';
import BasePowerObject from '../../powerObjects/basePowerObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';

const manaCost = 700; // mana cost of the power
const collisionDamage = 10; // the amount of damage it does when it collides

const directionVec = new BABYLON.Vector3(0, 0, 1); // direction of the cursor
const distance = 6;
const cursorSpeed = 2; // speed of the cursor
const fixedRotation = false;
const speed = 1.5;
const meshSize = 7;

/*
* Makes a block using joy cursor
*/
export default class WallPush extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.heroRotation = new BABYLON.Quaternion();
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/2),
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) - 2,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshSize*1.5, meshSize*1.5, 2);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      // run spawn
      var powerObj = new BasePowerObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(1),
        dropHeight:20, dropRange:100, collisionCallBack:true, damageMult:collisionDamage});

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.heroRotation);
      }


      // Move the powerObj towards the direction cursor
      // Get the direction Vector for the powerObj to follow
      powerObj.directionVec = this.cursor.mesh.position.subtract(this.cursor2.mesh.position).normalize().scaleInPlace(-speed);
      powerObj.targetVec = this.cursor2.mesh.position.clone();
      // Redefine the power update function
      powerObj.powerUpdate = function () {
        // move the power Obj towards its target
        if (BABYLON.Vector3.Distance(this.targetVec, this.mesh.position) > 5){
          this.mesh.position.addInPlace(this.directionVec);
        }
      }

    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }
      this.hero.slowDown = 100;
      // Get the hero rotation when he spawns the cursors
      this.heroRotation.copyFrom(this.hero.mask.rotationQuaternion);

      this.cursor = new PointCursor(this.game, this.hero, {direction: directionVec, distance: distance, fixed:false});
      this.cursor2 = new DirectionCursor(this.game, this.hero, {direction: directionVec, speed: cursorSpeed});
    }

    buttonUp(i) {
      // Check for cursor presence;
      if (!this.cursor){
        return;
      }

      this.hero.slowDown = 1;

      this.createMesh();
      this.cursor.destroy();
      this.cursor2.destroy();
      this.cursor = undefined;
      this.cursor2 = undefined;
    }
}
