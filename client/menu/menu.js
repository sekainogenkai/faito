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

export default class Menu extends React.Component {
    handleHide(e) {
        e.preventDefault();
        this.props.onHide();
    }

    render() {
        return (
            <div className="menu" style={styles.menu}>
                    <h2 style={styles.mainMenuItem}>MENU</h2>
                    <button style={styles.mainMenuItem} onClick={this.handleHide.bind(this)}>HIDE THE MENU</button>
            </div>
        );
    }
}
