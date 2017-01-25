import BABYLON from 'babylonjs';


export default class MapLoader {
    constructor (mapName='test1', game) {
        this.game = game;
        require(`../models/maps/${mapName}.blend`).ImportMesh(BABYLON.SceneLoader, null,          this.game.scene, loadedMeshes => {
             this.setImpostors('boxImpostor', BABYLON.PhysicsImpostor.BoxImpostor);
        });
    }
    
    setImpostors (tag, impostorType) {
        this.game.scene.getMeshesByTags('boxImpostor').forEach(function(box) {
            box.physicsImpostor = new BABYLON.PhysicsImpostor(box, impostorType, {move: false});
            // Collision groups
            box.physicsImpostor.physicsBody.collisionFilterGroup = this.game.collisionGroupGround;
            box.physicsImpostor.physicsBody.collisionFilterMask = this.game.collisionGroupNormal | this.game.collisionGroupGround;
            // Shadows
            this.game.shadowGenerator.getShadowMap().renderList.push(box);
            box.receiveShadows = true;
        }, this);
    }
}