/**
 * Ensures that an object has a key set to a particular value with
 * lazy value instantiation.
 */
export function ensureObjectEntry(o, key, buildDefaultValue) {
    const value = o[key];
    if (value !== undefined) {
        return value;
    }
    const builtValue = o[key] = buildDefaultValue();
    if (builtValue === undefined) {
        throw new Error('buildDefaultValue() returned undefined, a value not supported by ensureObjectEntry()');
    }
    return builtValue;
}

/**
 * Ensures that a mesh has a user-mutable object for holding state and
 * returns it.
 */
export function ensureUserData(mesh) {
    return ensureObjectEntry(mesh, 'userData', () => Object.create(null));
}

export function ensureUserDataEntry(mesh, key, buildDefaultValue) {
    return ensureObjectEntry(ensureUserData(mesh), key, buildDefaultValue);
}

// The lists of handlers that is updated as things are registered and
// unregistered.
const sceneBeforeRenderHandlersSymbol = Symbol('sceneBeforeRenderHandlers');
const sceneAfterRenderHandlersSymbol = Symbol('sceneAfterRenderHandlers');

// The handler registered with Scene that proxies the event to all the
// handlers we’ve recorded as registered.
const sceneBeforeRenderSymbol = Symbol('sceneBeforeRender');
const sceneAfterRenderSymbol = Symbol('sceneAfterRender');

const disposeHandlerRegisteredSymbol = Symbol('disposeHandlerRegistered');

const onDispose = mesh => {
    const scene = mesh.getScene();
    const beforeRender = mesh.userData[sceneBeforeRenderSymbol];
    if (beforeRender) {
        scene.unregisterBeforeRender(beforeRender);
    }
    const afterRender = mesh.userData[sceneAfterRenderSymbol];
    if (afterRender) {
        scene.unregisterAfterRender(mesh.userData[sceneAfterRenderSymbol]);
    }
};

const registerBeforeAfterSceneRender = function (mesh, beforeAfterFunctionName, handlersListSymbol, sceneHandlerSymbol, handler) {
    if (mesh.isDisposed()) {
        throw new Error(`Attempt to add handler to disposed Mesh ${mesh.name}`);
    }
    if (typeof handler !== 'function') {
        throw new Error('handler must a function');
    }
    const scene = mesh.getScene();
    if (!scene) {
        throw new Error(`Unable to find scene for mesh ${mesh.name}`);
    }
    const userData = ensureUserData(mesh);
    ensureObjectEntry(userData, handlersListSymbol, () => {
        // Register the proxy for this handler.
        const handlers = [];
        scene[beforeAfterFunctionName](userData[sceneHandlerSymbol] = () => {
            for (const handler of handlers) {
                handler(mesh);
            }
        });
        return handlers;
    }).push(handler);
    ensureObjectEntry(userData, disposeHandlerRegisteredSymbol, () => {
        mesh.onDisposeObservable.add(onDispose);
        return null;
    });
};

/**
 * Registers a beforeRender that runs before every scene render.
 *
 * Adds a new handler. Will not unregister any existing handlers.
 *
 * This is different than Mesh.registerBeforeRender() because it fires
 * even when the object is not visible (would not actually be rendered
 * because of occlusion).
 */
export function registerBeforeSceneRender(mesh, handler) {
    registerBeforeAfterSceneRender(mesh, 'registerBeforeRender', sceneBeforeRenderHandlersSymbol, sceneBeforeRenderSymbol, handler);
}

/**
 * Registers an afterRender that runs after every scene render.
 *
 * @see registerBeforeSceneRender
 */
export function registerAfterSceneRender(mesh, handler) {
    registerBeforeAfterSceneRender(mesh, 'registerAfterRender', sceneAfterRenderHandlersSymbol, sceneAfterRenderSymbol, handler);
}
