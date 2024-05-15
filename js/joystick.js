const joystickStates = {
	forward: false,
	backward: false,
	left: false,
	right: false,
}

const options = {
	zone: document.getElementById('joystick-div'),
	color: 'red',
}
const manager = nipplejs.create(options)

manager.on('move', (evt, data) => {
	if (data.distance < 10) {
		ws.send(JSON.stringify({ message: 'keyUpAll', type: 'input', state: 'up' }))

		return;
	}

	if (data.distance > 40) {
		ws.send(JSON.stringify({ message: 'keyDownSprint', type: 'input', state: 'down' }))
	}
	else {
		ws.send(JSON.stringify({ message: 'keyUpSprint', type: 'input', state: 'up' }))
	}
	
	let degree = data.angle.degree

	if (degree < 145 && degree > 35) {
		joystickStates.forward = true
		
		ws.send(JSON.stringify({ message: 'keyDownForward', type: 'input', state: 'down' }))
	}
	else
		joystickStates.forward = false

	if (degree < 325 && degree > 215) {
		joystickStates.backward = true
		
		ws.send(JSON.stringify({ message: 'keyDownBackward', type: 'input', state: 'down' }))
	}
	else
		joystickStates.backward = false

	if (degree < 235 && degree > 125) {
		joystickStates.left = true

		ws.send(JSON.stringify({ message: 'keyDownLeft', type: 'input', state: 'down' }))
	}
	else
		joystickStates.left = false

	if ((degree < 360 && degree > 305) || (degree < 55 && degree >= 0)) {
		joystickStates.right = true

		ws.send(JSON.stringify({ message: 'keyDownRight', type: 'input', state: 'down' }))
	}
	else
		joystickStates.right = false

	if (!joystickStates.forward) {
		ws.send(JSON.stringify({ message: 'keyUpForward', type: 'input', state: 'up' }))
	}
	if (!joystickStates.backward) {
		ws.send(JSON.stringify({ message: 'keyUpBackward', type: 'input', state: 'up' }))
	}
	if (!joystickStates.left) {
		ws.send(JSON.stringify({ message: 'keyUpLeft', type: 'input', state: 'up' }))
	}
	if (!joystickStates.right) {
		ws.send(JSON.stringify({ message: 'keyUpRight', type: 'input', state: 'up' }))
	}
})

manager.on('end', (evt, data) => {
	ws.send(JSON.stringify({ message: 'keyUpAll', type: 'input', state: 'up' }))

	joystickStates.forward = false
	joystickStates.backward = false
	joystickStates.left = false
	joystickStates.right = false
})
