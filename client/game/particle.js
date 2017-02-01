import BABYLON from 'babylonjs';

export default class Particle {
  constructor (game, particle, position) {
    // Set up particle system
    this.game = game;
    this.particleSystem = new BABYLON.ParticleSystem("particles", 10, this.game.scene);
    // Set the particle texture
    this.particleSystem.particleTexture = new BABYLON.Texture(particle, this.game.scene);
    // Set position
    this.particleSystem.emitter = position;

    // Changeable properties
    this.particleSystem.minLifeTime = 0.2;
    this.particleSystem.maxLifeTime = 0.5;

    this.particleSystem.minSize = 1;
    this.particleSystem.maxSize = 2;

    this.particleSystem.manualEmitCount = 5;
    this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    this.particleSystem.direction1 = new BABYLON.Vector3(-10, 0, 10);
    this.particleSystem.direction2 = new BABYLON.Vector3(10, 0, -10);


    this.particleSystem.gravity = new BABYLON.Vector3(0, 15, 0);

    // Set life of the system
    this.particleSystem.disposeOnStop = true;
    this.particleSystem.targetStopDuration = 5;

    this.particleSystem.disposeOnStop = true;

    this.particleSystem.start();
  }
}
