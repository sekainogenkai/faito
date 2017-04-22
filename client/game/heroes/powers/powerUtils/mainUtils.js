import BABYLON from 'babylonjs';
import {registerAfterSceneRender} from '../../../mesh-util.js';

const forwardVector = new BABYLON.Vector3(0, 0, 1);
const upVector = new BABYLON.Vector3.Up();

export const freezeHero = function (hero) {
    hero.moveBool = false;
};

export const secondsToTicks = seconds => 60*seconds;

const meshRemainingAnimationSymbol = Symbol('meshRemainingAnimation');
const meshAnimationLengthSymbol = Symbol('meshAnimationLength');
const meshAnimationTargetYSymbol = Symbol('meshTargetY');
const meshHeightSymbol = Symbol('meshHeight');
const remainingDelaySymbol = Symbol('remainingDelay');
/**
 * Removes mesh after some delay.
 */
const autoRemove = mesh => {
  if (!mesh.userData[remainingDelaySymbol]--) {
    mesh.dispose();
    console.log('mesh disposed');
  }
};

const autoPhysicsRemove = mesh => {
    mesh.userData[remainingDelaySymbol]--
    if (mesh.userData[remainingDelaySymbol] == 0) {
        mesh.physicsImpostor.physicsBody.collisionFilterGroup = 4; // Adds the object to collisionGroupFall TODO: learn how to reference
        mesh.physicsImpostor.physicsBody.type = 2; // Changes the object so it becomes static
        mesh.physicsImpostor.physicsBody.updateMassProperties();
    } else if (mesh.userData[remainingDelaySymbol] < 0){
      const remainingAnimation = mesh.userData[meshRemainingAnimationSymbol];
      if (remainingAnimation !== undefined) {
          if (remainingAnimation) {
            mesh.position.y = mesh.userData[meshAnimationTargetYSymbol] + mesh.userData[meshHeightSymbol] * remainingAnimation/mesh.userData[meshAnimationLengthSymbol];
            mesh.userData[meshRemainingAnimationSymbol]--;
          } else {
            mesh.dispose();
            console.log('physics mesh disposed');
          }
      }
    }
};
/**
 * Setup a mesh to be removed after some delay.
 */
export const configureAutoRemove = (mesh, delay, length=0.25) => {
    if (!mesh.userData) {
        mesh.userData = {};
    }
    mesh.userData[remainingDelaySymbol] = secondsToTicks(delay);
    if (!mesh.physicsImpostor) {
        registerAfterSceneRender(mesh, autoRemove);
    } else {
      var meshHeight = mesh.getBoundingInfo().boundingBox.extendSize.y*2;
      var animationLength = secondsToTicks(length);
      mesh.userData[meshHeightSymbol] = meshHeight;
      mesh.userData[meshAnimationTargetYSymbol] = -meshHeight/2;
      mesh.userData[meshRemainingAnimationSymbol] = animationLength;
      mesh.userData[meshAnimationLengthSymbol] = animationLength;
        registerAfterSceneRender(mesh, autoPhysicsRemove);
    }
};

// Gets highest ground object's y
export const getHeightAtCoordinates = function(scene, x=0, z=0) {
  var maxHeight = 256;
  var ray = new BABYLON.Ray(new BABYLON.Vector3(x, maxHeight, z), new BABYLON.Vector3(0, -1, 0), 2*maxHeight);
  var res = scene.pickWithRay(ray, (mesh) => { return BABYLON.Tags.HasTags(mesh) && mesh.matchesTagsQuery("isGround")});
  if ( res.pickedPoint ) {
    return res.pickedPoint.y;
  }
  return 0;
}

// Gets height of a specific mesh at coordinates -- usually used on the ground mesh
export const getHeightOfMeshAtCoordinates = function(mesh, x=0, z=0) {
  var maxHeight = 256;
  var ray = new BABYLON.Ray(new BABYLON.Vector3(x, maxHeight, z), new BABYLON.Vector3(0, -1, 0), 2*maxHeight);
  var res = mesh.intersects(ray, true);
  if ( res.pickedPoint ) {
    return res.pickedPoint.y;
  }
  return 0;
}

export const rotateFromHero = function(hero, direction, distance=false) {
  const matrix = new BABYLON.Matrix();
  let newDirectionVec = new BABYLON.Vector3(0,0,0);
  hero.mask.rotationQuaternion.toRotationMatrix(matrix);
  BABYLON.Vector3.TransformCoordinatesToRef(direction, matrix, newDirectionVec);
  if (distance) {
    newDirectionVec.normalize().scaleInPlace(distance);
  }
  return newDirectionVec;
}
