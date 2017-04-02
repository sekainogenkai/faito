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


export default class StageMenuPage extends React.Component {
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
    {this.state.players}
    </div>;
  }
}

export function CharacterSelectMenuPage(props) {
  props = Object.assign({
    playerIndex: 0,
  }, props);
  if (!props.players) throw new Error('Must pass players.');
  // Base case: no players left to choose for.
  if (props.playerIndex >= props.players.players.length) {
    return <StageSelectMenuPage {...props} players={props.players}/>;
  }
  // Is the current player defined? Otherwise recurse.
  const player = props.players.players[props.playerIndex];
  if (!player) {
    return <CharacterSelectMenuPage {...props} players={players} playerIndex={props.playerIndex + 1}/>;
  }
  // We have an actual current player to make a decision about! Yay~!
  return (
    <MenuPage {...props}>
      <LabelMenuItem>
        {player.name} Character Selection
      </LabelMenuItem>
      <ButtonMenuItem action={menu => menu.pushMenuPage(
        <CharacterSelectMenuPage players={props.players} playerIndex={props.playerIndex + 1}/>
      )}>Hero 1</ButtonMenuItem>
      <ButtonMenuItem action={menu => menu.pushMenuPage(
        <CharacterSelectMenuPage players={props.players} playerIndex={props.playerIndex + 1}/>
      )}>Hero 2</ButtonMenuItem>
      <ButtonMenuItem action={menu => menu.popMenuPage()}>Back</ButtonMenuItem>
    </MenuPage>
  );
}
