export const freezeHero = function (hero) {
    hero.moveBool = false;
};

export const secondsToTicks = seconds => 60*seconds;

const remainingDelaySymbol = Symbol('remainingDelay');
/**
 * Removes mesh after some delay.
 */
const autoRemove = mesh => {
    mesh.userData[remainingDelaySymbol]--
    if (mesh.userData[remainingDelaySymbol] < 0) {
        mesh.physicsImpostor.physicsBody.collisionFilterGroup = 4;
        if (mesh.position.y < -mesh.getBoundingInfo().boundingBox.extendSize.y){
          mesh.dispose();
          console.log('mesh disposed')
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
    mesh.registerAfterRender(autoRemove);
};
