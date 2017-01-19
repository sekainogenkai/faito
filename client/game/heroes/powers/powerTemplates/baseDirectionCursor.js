import basePower from './basePower';
import BABYLON from 'babylonjs';
import {secondsToTicks, configureAutoRemove} from '../powerUtils/mainUtils';

const initialDirectionVec = new BABYLON.Vector3(0, 0, 1);
const matrix = new BABYLON.Matrix();
const directionSymbol = Symbol('direction');

// The animator for the cursor/cursor that goes out while the user
// is holding the button.
const updateCursor = mesh => {
    const direction = mesh.userData[directionSymbol];
    if (direction) {
        mesh.position.addInPlace(direction);
    }
};

const meshRemainingAnimationSymbol = Symbol('meshRemainingAnimation');
const meshAnimationTargetYSymbol = Symbol('meshTargetY');
const meshAnimationLengthSymbol = Symbol('meshAnimationLength');
const meshGameReferenceSymbol = Symbol('meshGameReference');
const meshHeightSymbol = Symbol('meshHeight');

// The animator for the mesh.
const updateMesh = mesh => {
    const remainingAnimation = mesh.userData[meshRemainingAnimationSymbol];
    if (remainingAnimation !== undefined) {
        if (remainingAnimation) {
            mesh.position.y = mesh.userData[meshAnimationTargetYSymbol] - mesh.userData[meshHeightSymbol] * remainingAnimation/mesh.userData[meshAnimationLengthSymbol];
            mesh.userData[meshRemainingAnimationSymbol]--;
        } else {
            mesh.userData[meshRemainingAnimationSymbol] = undefined;
            mesh.physicsImpostor.physicsBody.collisionFilterMask = mesh.userData[meshGameReferenceSymbol].collisionGroupGround | mesh.userData[meshGameReferenceSymbol].collisionGroupNormal;
        }
    }
};

export default class baseDirectionCursor extends basePower {
    constructor(game, hero) {
        super(game, hero);
        this.cursor = null;
        //this.mask.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
        this._directionVec = new BABYLON.Vector3(0, 0, 0);
    }

    buttonDown(i) {
    }

    buttonUp(i) {
    }

    createCursor (manaCost=100, speed=100) {
      if (this.cursor || !this.hero.consumeMana(manaCost)) {
          return;
      }
      // Create the cursor
      const cursor = this.cursor = BABYLON.Mesh.CreateSphere("power", 5, 1, this.game.scene);
      var material = new BABYLON.StandardMaterial("red_material", this.game.scene);
      material.diffuseColor = BABYLON.Color3.Red();
      cursor.material = material;

      // Set the position and apply force
      cursor.position.x = this.hero.mask.position.x;
      cursor.position.y = 0; // Make sure it's on the ground
      cursor.position.z = this.hero.mask.position.z;
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      cursor.applyImpulse(initialVec.normalize().scale(speed), cursor.getAbsolutePosition());
      configureAutoRemove(cursor, 6);
      cursor.userData = cursor.userData || {};

      this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
      BABYLON.Vector3.TransformCoordinatesToRef(initialDirectionVec, matrix, this._directionVec);
      this._directionVec.scaleInPlace(0.5);
      cursor.userData[directionSymbol] = this._directionVec;

      cursor.registerBeforeRender(updateCursor);
    }

    createPowerMesh (){
      // Used to store the mesh that the createPower will spawn
    }

    createPower (initLength=0.25, removeDelay=5, removeLength=0.25, initTargetY=0) {
      if (this.cursor) {
          // Place a mesh
          const mesh = this.createPowerMesh();
          var meshHeight = mesh.getBoundingInfo().boundingBox.extendSize.y*2;
          var animationLength = secondsToTicks(initLength);

          mesh.position.copyFrom(this.cursor.position);
          mesh.position.y = -meshHeight/2;
          mesh.userData = mesh.userData || {};
          mesh.userData[meshAnimationTargetYSymbol] = meshHeight/2;//((initTargetY == 0) ? initTargetY : meshHeight);
          mesh.userData[meshRemainingAnimationSymbol] = animationLength;
          mesh.userData[meshAnimationLengthSymbol] = animationLength;
          mesh.userData[meshGameReferenceSymbol] = this.game;
          mesh.userData[meshHeightSymbol] = meshHeight;
          mesh.registerAfterRender(updateMesh);
          configureAutoRemove(mesh, removeDelay, removeLength);

          // Remove the cursor
          //this.cursor.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:0.9});
          this.cursor.userData[directionSymbol] = null;
          this.cursor.dispose();
          this.cursor = null;
      }
    }
}
