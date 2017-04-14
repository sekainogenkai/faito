import {Buttons} from '../game/input';
import {Menu, MenuPage, ButtonMenuItem, LabelMenuItem} from './menu';
import {DummyInputTarget, ProxyInputTarget} from '../player';
import StageSelectMenuPage from './stage-selection';
import React from 'react';

const heroesContext = require.context('../game/heroes', false, /\.js$/);
const heroKeys = heroesContext.keys().filter(key => key !== './baseHero.js');

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
              this.setState({
                lockedIn: false,
              });
          }
          if (!this.state.lockedIn) {
            this.setState({
              characterIndex: (this.state.characterIndex + (function () {
                switch (button) {
                  case Buttons.JoyLeft: return -1;
                  case Buttons.JoyRight: return 1;
                }
                return 0;
              })() + heroKeys.length) % heroKeys.length,
            });
          }
        } else {
          switch (button) {
            case Buttons.A:
            console.log('pressed button a');
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

  get lockedIn() {
    return this.state.lockedIn;
  }

  render() {
    if (this.state.active) {
      return <div>
      <p>{this.props.player.name} has chosen character {heroesContext(heroKeys[this.state.characterIndex]).name}. Press [attack2] to abort.</p>
      {this.state.lockedIn &&
        <p> LOCKED IN </p>
      }
      </div>;
    }
    return <div>
    <p>{this.props.player.name} Press [attack1] to join.</p>
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
        console.log(newPlayers);
        return {
          players: newPlayers,
        };
      });
      return proxy;
    });
  }

  render() {
    return <div className="menu-page" style={{backgroundColor: 'white'}}>
    <div className="menu-item">Press [Attack] to join.</div>
    {this.state.players.filter(player => player)}
    </div>;
  }
}
