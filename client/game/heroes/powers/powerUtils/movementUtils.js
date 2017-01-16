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
