import BABYLON from 'babylonjs';
import {registerAfterSceneRender} from '../../../mesh-util.js';

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

/**
Work around for ground mesh
**/
export const getHeightAtCoordinates = function(mesh, x=0, z=0) {
  var maxHeight = 256;
  var ray = new BABYLON.Ray(new BABYLON.Vector3(x, maxHeight, z), new BABYLON.Vector3(0, -1, 0), 2*maxHeight);
  var res = mesh.intersects(ray, true);
  return res.pickedPoint.y;
}
