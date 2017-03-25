import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../base/basePower';
import JointObject from '../../powerObjects/jointObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 500; // mana cost of the power

const directionVec = new BABYLON.Vector3(0, 0, 1); // position of the cursor
const distance = 10; // cursor scalar

const fixedRotation = false;
const meshSize = 1;
const meshScaling = new BABYLON.Vector3(2, 1, 5);

/*
* Makes a block using joy cursor
*/
export default class SkateBoard extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.object = null;
      this.objectLastFrame = false;
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.hero.mask.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.hero.mask.position.x, this.hero.mask.position.z)) - (meshSize/2) - 2,
        this.hero.mask.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.hero.mask.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.hero.mask.position.x, this.hero.mask.position.z)) + (meshSize/2) - 2,
        this.hero.mask.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = meshScaling;

      console.log(mesh.material);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.01, restitution:0.9}, this.game.scene);

      // Create a new joint, needs to be a new joint
      var distJoint = new BABYLON.HingeJoint( {
        mainPivot:  new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(0, 1, 0),
        mainAxis: new BABYLON.Vector3(0, 1, 0),
        connectedAxis: new BABYLON.Vector3(0, 1, 0)}
      );

      // run spawn
      this.object = new JointObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(10),
        dropHeight:10, dropRange:1000, collisionCallBack:true, damageMult:10, damageTimerMax:50},
        // projectileObject values
        {target:this.hero.mask, joint:distJoint, mass:1} );


      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana
      if (this.object || !this.hero.consumeMana(manaCost)){
        return;
      }
      this.createMesh();
      //console.log('fixedRotation is now false');
      this.hero.body.fixedRotation = false;
      this.hero.body.updateMassProperties();
      this.hero.slowDown = .5;
    }

    update() {
      // check if skate board exists
      if (this.object && this.object._currentState == 2) {
        this.object = null;
      }

      // Skate board disappears
      if (!this.object && this.objectLastFrame) {
        this.hero.slowDown = 1;
        //console.log('fix rotation is now true');
        this.hero.updateMassProperties();
      }

      this.objectLastFrame = !!this.object;
    }

    buttonUp(i) {

    }


}
