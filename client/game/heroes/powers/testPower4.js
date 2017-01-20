import baseDirectionCursor from './powerTemplates/baseDirectionCursor';
import BABYLON from 'babylonjs';

export default class testPower extends baseDirectionCursor {
    constructor(game, hero) {
        super(game, hero);
    }

    // TODO: fix the mesh spawning at 0,0,0 and hitting the players
    createPowerMesh (){
      const mesh = BABYLON.Mesh.CreateSphere('mesh', 10, 10, this.game.scene);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.collisionGroupNormal;
      return mesh;
    }

    buttonDown(i) {
      this.createCursor(10, 200, 10);
    }

    buttonUp(i) {
      this.createPower(5, 5, 5);
    }
}
