import {Buttons} from '../game/input';
import {Menu, MenuPage, ButtonMenuItem, LabelMenuItem} from './menu';
import {DummyInputTarget, ProxyInputTarget} from '../player';
import StageSelectMenuPage from './stage-selection';
import React from 'react';

class StageMenuPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      characterIndex: 0,
    };

    this.props.input.setTarget(Object.assign(new DummyInputTarget(), {
      buttonDown: button => {
        if (this.state.active) {
          this.setState({
            active: button != Buttons.B,
            characterIndex: this.state.characterIndex + (function () {
              switch (button) {
                case Buttons.JoyLeft: return -1;
                case Buttons.JoyRight: return 1;
              }
              return 0;
            })(),
          });
        } else {
          if (button == Buttons.A) {
            console.log('pressed button a');
            this.setState({
              active: true,
            });
          }
        }
      },
    }));
  }

  render() {
    if (this.state.active) {
      return <div>
      <p>{this.props.player.name} has chosen character {this.state.characterIndex}. Press [attack2] to abort.</p>
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
  }

  componentDidMount() {
    this.props.players.setInputTargetFinder((i, player) => {
      const proxy = new ProxyInputTarget(new DummyInputTarget());
      const newPlayers = this.state.players.slice();
      newPlayers[i] = <StageMenuPlayer key={i} player={player} input={proxy} />;
      this.setState({
        players: newPlayers,
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
