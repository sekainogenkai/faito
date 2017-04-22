import {Buttons} from '../game/input';
import {Menu, MenuPage, ButtonMenuItem, LabelMenuItem} from './menu';
import {DummyInputTarget, ProxyInputTarget} from '../player';
import StageSelectMenuPage from './stage-selection';
import React from 'react';
import {BabylonJS} from '../react-babylonjs';
import BABYLON from 'babylonjs';
import {render} from 'react-dom';
import MenuCamera from '../game/menuCamera';

export const heroesContext = require.context('../game/heroes', false, /\.js$/);
export const heroKeys = heroesContext.keys().filter(key => key !== './baseHero.js');


const styles = {
    viewBlock: {
      display: 'flex',
      flexDirection: 'row',
    },
    playerViewFullBlock: {
      margin: '20px',
    },
    playerViewBlock: {
      border: '3px solid black',
      backgroundColor: '#fefefe',
      height: '220px',
      width: '220px',
    },
    playerViewBlockText: {
      fontSize: '1.2em',
      fontWeight: '700',
      padding: '10px 5px 10px 5px',
      backgroundColor: '#fefefe',
      border: '4px solid black',
    },
    lockedInText: {
      fontSize: '1.5em',
      fontWeight: '800',
      padding: '10px 5px 10px 5px',
      backgroundColor: '#66ff66',
      border: '4px solid black',
    },
};


class StageMenuPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      lockedIn: false,
      characterIndex: 0,
    };

    this.props.input.setTarget(Object.assign(new DummyInputTarget(), {
      buttonDown: button => {
        if (this.state.active) {
          switch (button) {
            case Buttons.A:
              this.setState({
                lockedIn: true,
              });
              break;
            case Buttons.B:
              if (this.state.lockedIn) {
                this.setState({
                  lockedIn: false,
                });
              } else {
                this.setState({
                  active: false,
                });
              }
          }
            if (!this.state.lockedIn) {
              let changeHeroNumber = 0;
              switch (button) {
                case Buttons.JoyLeft:
                  changeHeroNumber = -1;
                  break;
                case Buttons.JoyRight:
                  changeHeroNumber = 1;
                  break;
              }
              if (changeHeroNumber != 0) {
                let newCharacterindex = (this.state.characterIndex + changeHeroNumber) % heroKeys.length;
                if (newCharacterindex < 0) {
                  newCharacterindex = heroKeys.length - 1;
                }
                this.setState({
                  characterIndex: newCharacterindex,
                });
                //console.log(this.state.character)
                this.loadDiffScene();
              }
          }
        } else { // If not active
          switch (button) {
            case Buttons.A:
            this.setState({
              active: true,
            });
            break;
            case Buttons.B:
              this.props.wantsBack();
              break;
          }
        }
      },
    }));
  }

  componentDidUpdate() {
    this.props.stateChanged();
  }

  get active() {
    return this.state.active;
  }

  get characterIndex() {
    return this.state.characterIndex;
  }

  get lockedIn() {
    return this.state.lockedIn;
  }

  doRenderLoop() {
    this.scene.render();
  }

  loadDiffScene() {
    if (this.mesh) {
      this.mesh.dispose();
    }
    //loadMenuScene(this, 1);
    require(`../../models/heroes/${heroesContext(heroKeys[this.state.characterIndex]).heroName}.blend`).ImportMesh(BABYLON.SceneLoader, null, this.scene, loadedMeshes => {
      this.mesh = loadedMeshes[0];//.clone(this.name);
      this.mesh.position.y -= 3;

      console.log('props', this.props);
      let id = this.props.player.index;
      console.log(id);
      let material = new BABYLON.StandardMaterial(id + 'playermaterialscene', this.scene);
      let colId = function (id, mult) {
        return Math.abs(((id * mult) % 255) / 255);
      }
      let color = new BABYLON.Color3(colId(id + .1, 50), colId(id + .2, -100), colId(id + 1, 200));
      console.log(color);
      material.diffuseColor = color;
      material.specularColor = new BABYLON.Color3(1, 1, 1);
      this.mesh.material = material;

      let idleAnimation = this.mesh.skeleton.getAnimationRange('idle');
      this.scene.beginAnimation(this.mesh.skeleton, idleAnimation.from+1, idleAnimation.to, true, 1);
    });
  }

  onEngineCreated(engine) {
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(this.engine);

    let camera = new MenuCamera(this, {min:7, max:9});

    let dirLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1, -.7, 0), this.scene);
    let dirLightStrength = 1;
    dirLight.diffuse = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);
    dirLight.specular = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);

    dirLightStrength = .8;
    let dirLight2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -.3, .4), this.scene);
    dirLight2.diffuse = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);
    dirLight2.specular = new BABYLON.Color3(dirLightStrength,dirLightStrength,dirLightStrength);

    this.scene.clearColor = new BABYLON.Color3(.7, .7, .7);

    this.loadDiffScene();
  }

  onEngineAbandoned() {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }

  render() {
    if (this.state.active) {
      return <div style={styles.playerViewFullBlock}>
      <p style={styles.playerViewBlockText}> {this.props.player.name} </p>
      <div style={styles.playerViewBlock}>
      <BabylonJS
      onEngineCreated={engine => this.onEngineCreated(engine)}
      onEngineAbandoned={engine => this.onEngineAbandoned(engine)}/>
      <p style={styles.playerViewBlockText}> {heroesContext(heroKeys[this.state.characterIndex]).heroName} </p>
      {this.state.lockedIn &&
        <p style={styles.lockedInText}> LOCKED IN </p>
      }
      </div>
      </div>;
    }
    return <div>
    <p style={styles.playerViewBlockText}>{this.props.player.name} <br/>Press [attack1] to join.</p>
    </div>
  }
}

export default class CharacterSelectMenuPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
    };
    this.playerRefs = [];
  }

  playerAskedForBack() {
    // Only go back out of this menu if all players are inactive.
    console.log(this);
    if (this.playerRefs.find(p => p.active)) {
      return;
    }
    this.props.menu.popMenuPage();
  }

  playerStateChanged() {
    console.log('Player state changed');
    if (!this.playerRefs.find(p => p.active && !p.lockedIn)
     && this.playerRefs.find(p => p.active && p.lockedIn)) {
      console.log('Start Game');
      console.log(this.playerRefs);
      const playerInfo = this.playerRefs.reduce((acc, val, i) => {
        if (val.active) {
          acc[i] = {
            characterIndex: val.characterIndex,
          };
        }
        return acc;
      }, {});
      this.props.menu.pushMenuPage(<StageSelectMenuPage game={this.props.game} playerInfo={playerInfo}/>);
    }
  }

  componentDidMount() {
    this.props.players.setInputTargetFinder((i, player) => {
      const proxy = new ProxyInputTarget(new DummyInputTarget());
      // setState is not synchronous. To mutate an array in it multiple
      // times before it applies the state update to this.state, must
      // use the callback pattern: http://stackoverflow.com/a/41445812
      this.setState(state => {
        console.log(JSON.stringify(state.newPlayers));
        const newPlayers = state.players.slice();
        newPlayers[i] = <StageMenuPlayer
          key={i}
          player={player}
          input={proxy}
          ref={playerRef => this.playerRefs[i] = playerRef}
          wantsBack={() => this.playerAskedForBack()}
          stateChanged={() => this.playerStateChanged()} />;
        return {
          players: newPlayers,
        };
      });
      return proxy;
    });
  }

  render() {
    return <div className="menu-page" style={styles.viewBlock}>
      {this.state.players.filter(player => player)}
    </div>;
  }
}
