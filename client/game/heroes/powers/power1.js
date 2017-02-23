import BABYLON from 'babylonjs';
import DirectionCursor from './cursors/directionCursor';

export default class Power1 {
    constructor(game, hero) {
        this.game = game;
        this.hero = hero;
        this.cursor = undefined;
    }

    // TODO: fix the mesh spawning at 0,0,0 and hitting the players
    createMesh (position) {
      this.mesh = BABYLON.Mesh.CreateBox('mesh', 5, this.game.scene);
      this.mesh.position.copyFrom(this.cursor.mesh.position);
      BABYLON.Tags.EnableFor(this.mesh);
      BABYLON.Tags.AddTagsTo(this.mesh, "checkJump");
      this.mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
      this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(this.mesh);
      this.mesh.receiveShadows = true;
    }

    buttonDown(i) {
      this.cursor = new DirectionCursor(this.game, this.hero);
    }

    buttonUp(i) {
      this.createMesh();
      this.cursor.mesh.dispose();
      delete this.cursor;
    }
}
