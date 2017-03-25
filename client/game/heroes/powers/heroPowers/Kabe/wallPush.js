import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks, rotateFromHero} from '../../powerUtils/mainUtils';
import BasePower from '../../base/basePower';
import BasePowerObject from '../../powerObjects/basePowerObject';
import DirectionCursor from '../../cursors/directionCursor';

const manaCost = 700; // mana cost of the power
const collisionDamage = 200; // the amount of damage it does when it collides

const directionVec = new BABYLON.Vector3(0, 0, 1); // direction of the cursor
const cursorSpeed = 2; // speed of the cursor
const fixedRotation = false;

const meshSize = 7;

/*
* Makes a block using joy cursor
*/
export default class WallPush extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.hero.mask.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.hero.mask.position.x, this.hero.mask.position.z)) - (meshSize/2),
        this.hero.mask.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) - 2,
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
      new BasePowerObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:20, lifeSpan:secondsToTicks(1),
        dropHeight:20, dropRange:100, collisionCallBack:true, damageMult:collisionDamage});

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

      this.cursor = new DirectionCursor(this.game, this.hero, {direction: directionVec, speed: cursorSpeed});
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
