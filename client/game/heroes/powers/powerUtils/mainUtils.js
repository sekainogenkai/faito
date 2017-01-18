export const freezeHero = function (hero) {
    hero.moveBool = false;
};

export const secondsToTicks = seconds => 60*seconds;

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
      if (mesh.position.y < -mesh.userData[meshHeightSymbol]){
        mesh.dispose();
        console.log('physics mesh disposed');
      } else {
        mesh.position.y -= 0.02 * mesh.userData[meshHeightSymbol]; // Falls speed it based on height of mesh
      }
    }
};
/**
 * Setup a mesh to be removed after some delay.
 */
export const configureAutoRemove = (mesh, delay) => {
    if (!mesh.userData) {
        mesh.userData = {};
    }
    mesh.userData[remainingDelaySymbol] = secondsToTicks(delay);
    if (!mesh.physicsImpostor) {
      mesh.registerAfterRender(autoRemove);
    } else {
      mesh.userData[meshHeightSymbol] = mesh.getBoundingInfo().boundingBox.extendSize.y
      mesh.registerAfterRender(autoPhysicsRemove);
    }

};
