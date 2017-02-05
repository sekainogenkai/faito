import {Buttons} from '../game/input';
import {DummyInputTarget} from '../player';
import React from 'react';

// maybe use this method later https://facebook.github.io/react-native/docs/style.html
const styles = {
    menu: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
        overflow: 'auto',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: 'center',
    },
    mainMenuItem: {
        padding: 10,
        backgroundColor: "lightblue",
    },
};

class DummyMenuInputTarget {
    down() {
    }

    up() {
    }

    action() {
    }
}

class MenuInputTarget extends DummyInputTarget {
    constructor() {
        super();
        this.setTarget(new DummyMenuInputTarget());
    }

    buttonDown(button) {
        switch (button) {
        case Buttons.JoyDown: this._target.down(); break;
        case Buttons.JoyUp: this._target.up(); break;
        case Buttons.A: this._target.action(); break;
        }
    }

    setTarget(target) {
        this._target = target;
    }
}

export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = Object.assign(this.state || {}, {
            menuPages: [React.Children.only(props.children)],
        });
        this._inputTarget = new MenuInputTarget();
        // In the future could make per-player cursors in the
        // menu. For now, just traditional shared menu.
        props.players.setInputTargetFinder((i, player) => this._inputTarget);
    }

    /**
     * MenuPages call this get input focused on them.
     */
    setMenuInputTarget(target) {
        this._inputTarget.setTarget(target);
    }

    /**
     * Push a new MenuPage onto the stack, causing it to be displayed
     * in place of the current one.
     */
    pushMenuPage(menuPage) {
        this.setState({
            menuPages: this.state.menuPages.concat([menuPage]),
        });
    }

    popMenuPage() {
        // If this would remove the last one, hide the menu instead.
        const nextMenuPages = this.state.menuPages.slice(0, this.state.menuPages.length - 1);
        const nextMenuPage = nextMenuPages[nextMenuPages.length - 1];
        this.setState({
            menuPages: nextMenuPages,
        });
        if (!nextMenuPage) {
            this.props.onHide();
        }
    }

    render() {
        const children = this.state.menuPages[this.state.menuPages.length - 1] || [];
        return <div className="menu" style={styles.menu}>
            {React.Children.map(children, (child, i) => React.cloneElement(child, {
                menu: this,
                // If we don’t have a different key, React applies the
                // state from from MenuPage to sub menu, etc., because
                // it thinks we’re rerendering the same instance.
                key: `${this.state.menuPages.length}`,
            }))}
            </div>;
    }
}

export class MenuPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0,
        };
        this.actions = [];
    }

    handleMenuItemMounted(i, menuItem) {
        this.actions[i] = () => menuItem.action(this.props.menu);
    }

    action() {
        const action = this.actions[this.state.currentIndex];
        if (!action) {
            return;
        }
        action();
    }

    componentDidMount() {
        this.props.menu.setMenuInputTarget(this);
    }

    down() {
        this.setState({
            currentIndex: Math.min(this.state.currentIndex + 1, React.Children.count(this.props.children) - 1),
        });
    }

    up() {
        this.setState({
            currentIndex: Math.max(this.state.currentIndex - 1, 0),
        });
    }

    render() {
        return <div className="menu-page">
            {React.Children.map(this.props.children, (child, i) => React.cloneElement(child, {
                active: i === this.state.currentIndex,
                key: i,
                mounted: menuItem => this.handleMenuItemMounted(i, menuItem),
            }))}
        </div>;
    }
}

export class MenuItem extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.mounted(this);
    }

    render() {
        return <div className="menu-item" style={{
            backgroundColor: this.props.active ? 'green' : 'white',
        }}>
            {this.props.children}
            </div>;
    }
}

export class ButtonMenuItem extends MenuItem {
    constructor(props) {
        super(props);
    }

    action(menu) {
        this.props.action(menu);
    }
}
