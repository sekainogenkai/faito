import React from 'react';
import {render} from 'react-dom';
import BABYLON from 'babylonjs';
import {BabylonJS} from './react-babylonjs.js';

class Game extends React.Component {
  doRenderLoop() {
    this.scene.render();
  }

  handleEngineCreated(engine) {
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(engine);

    //controllable camera
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3.Zero(), this.scene);
    camera.setPosition(new BABYLON.Vector3(0, 15, -30));
    camera.attachControl(this.scene.getEngine().getRenderingCanvas(), false);

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this.scene);

    this.scene.enablePhysics(
      new BABYLON.Vector3(0, -9.81, 0),
      new BABYLON.OimoJSPlugin());
    for (var x in [0,1]) {
      require('../models/omi.blend').Append(BABYLON.SceneLoader, this.scene, loadedScene => {
        /*onsuccess*/
      //  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
        loadedScene.beginAnimation(this.scene.skeletons[x], 0, 60, true, 2);
      }, x => {/*onprogress*/}, ex => {/*onerror*/});
    }
  }

  handleEngineAbandoned(engine) {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }

  render() {
    return <BabylonJS onEngineCreated={engine => this.handleEngineCreated(engine)} onEngineAbandoned={engine => this.handleEngineAbandoned(engine)}/>;
  }
}

render(<Game/>, document.getElementById("game-container"));
