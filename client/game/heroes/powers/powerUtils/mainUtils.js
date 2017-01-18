export const freezeHero = function (hero) {
    hero.moveBool = false;
};

export const secondsToTicks = seconds => 60*seconds;

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
    if (!mesh.userData[remainingDelaySymbol]--) {
        mesh.physicsImpostor.physicsBody.collisionFilterGroup = 4;
        mesh.physicsImpostor.physicsBody.linearDamping = 0.999;
        mesh.physicsImpostor.physicsBody.fixedRotation = true;
        mesh.physicsImpostor.physicsBody.mass = 100;
        mesh.physicsImpostor.physicsBody.type = 1;
        mesh.physicsImpostor.physicsBody.updateMassProperties();
    }
    if (mesh.position.y < -mesh.getBoundingInfo().boundingBox.extendSize.y){
      mesh.dispose();
      console.log('physics mesh disposed');
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
      mesh.registerAfterRender(autoPhysicsRemove);
    }

};
