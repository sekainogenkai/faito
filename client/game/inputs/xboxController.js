var xbox360pad;
var genericpad;

var gamepadConnected = function (gamepad) {
    startingInstructions.className = "hidden";
    padLogs.className = "";
    if (gamepad.index === 0) {
        gamepad.onleftstickchanged(function (values) {
            console.log("left stick:  X: " + values.x + " Y: " + values.y);
        });
        gamepad.onrightstickchanged(function (values) {
            console.log("right stick:   X: " + values.x + " Y: " + values.y);
        });
        if (gamepad instanceof BABYLON.Xbox360Pad) {
            Xbox360Section.className = "";
            xbox360pad = gamepad;
            xbox360pad.onlefttriggerchanged(function (value) {
                console.log("left trigger value " + value.toString());
            });
            xbox360pad.onrighttriggerchanged(function (value) {
                console.log("right trigger value " + value.toString());
            });
            xbox360pad.onbuttondown(function (button) {
                console.log("gamepad: " + gamepad.index);
                switch (button) {
                    case 0:
                        console.log("A pressed");
                        break;
                    case 1:
                        console.log("B pressed");
                        break;
                    case 2:
                        console.log("X pressed");
                        break;
                    case 3:
                        console.log("Y pressed");
                        break;
                    case 5:
                        console.log("Back pressed");
                        break;
                    case 4:
                        console.log("Start pressed");
                        break;
                    case 6:
                        console.log("LB pressed");
                        break;
                    case 7:
                        console.log("RB pressed");
                        break;
                    case 8:
                        console.log("LeftStick pressed");
                        break;
                    case 9:
                        console.log("RightStick pressed");
                        break;
                }
            });
            xbox360pad.onbuttonup(function (button) {
                console.log("gamepad: " + gamepad.index);
                switch (button) {
                    case 0:
                        console.log("A released");
                        break;
                    case 1:
                        console.log("B released");
                        break;
                    case 2:
                        console.log("X released");
                        break;
                    case 3:
                        console.log("Y released");
                        break;
                    case 5:
                        console.log("Back released");
                        break;
                    case 4:
                        console.log("Start released");
                        break;
                    case 6:
                        console.log("LB released");
                        break;
                    case 7:
                        console.log("RB released");
                        break;
                    case 8:
                        console.log("LeftStick released");
                        break;
                    case 9:
                        console.log("RightStick released");
                        break;
                }
            });
            xbox360pad.ondpaddown(function (button) {
                console.log("gamepad: " + gamepad.index);
                switch (button) {
                    case 1:
                        console.log("Down pressed");
                        break;
                    case 2:
                        console.log("Left pressed");
                        break;
                    case 3:
                        console.log("Right pressed");
                        break;
                    case 0:
                        console.log("Up pressed");
                        break;
                }
            });
            xbox360pad.ondpadup(function (button) {
                console.log("gamepad: " + gamepad.index);
                switch (button) {
                    case 1:
                        console.log("Down released");
                        break;
                    case 2:
                        console.log("Left released");
                        break;
                    case 3:
                        console.log("Right released");
                        break;
                    case 0:
                        console.log("Up released");
                        break;
                }
            });
        } else {
            GenericPadSection.className = "";
            genericpad = gamepad;
            genericpad.onbuttondown(function (buttonIndex) {
                console.log("Button " + buttonIndex + " pressed");
            });
            genericpad.onbuttonup(function (buttonIndex) {
                console.log("Button " + buttonIndex + " released");
            });
        }
    }
};
                                  
var gamepads = new BABYLON.Gamepads(gamepadConnected);
