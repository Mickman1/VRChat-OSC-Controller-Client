const joystickInputMap = {
	forward: 	{ state: false, lastState: false },
	backward: { state: false, lastState: false },
	left: 		{ state: false, lastState: false },
	right: 		{ state: false, lastState: false },
	sprint: 	{ state: false, lastState: false },
}

const joystickOptions = {
	zone: document.getElementById('joystick-div'),
	color: 'red',
	size: 150,
}
const joystickManager = nipplejs.create(joystickOptions)

joystickManager.on('move', (evt, data) => {
	const degree = data.angle.degree

	if (data.distance < 10)
		return;

	// Sprint
	if (data.distance > 55) {
		joystickInputMap.sprint.state = true

		if (!joystickInputMap.sprint.lastState)
			ws.send(JSON.stringify({ command: 'keyDownSprint', type: 'input', state: 'down' }))
	}
	else {
		joystickInputMap.sprint.state = false

		if (joystickInputMap.sprint.lastState)
			ws.send(JSON.stringify({ command: 'keyUpSprint', type: 'input', state: 'up' }))
	}
	joystickInputMap.sprint.lastState = joystickInputMap.sprint.state

	// Determine quadrant (For right, account for 0 / 360 degree math)
	// 110° per quadrant, 20° for diagonal overlap
	joystickInputMap.forward.state = (degree < 145 && degree > 35 && data.distance > 15)
	joystickInputMap.backward.state = (degree < 325 && degree > 215 && data.distance > 15)
	joystickInputMap.left.state = (degree < 235 && degree > 125 && data.distance > 15)
	joystickInputMap.right.state = ((degree < 360 && degree > 305) || (degree < 55 && degree >= 0) && data.distance > 15)

	const keyDownMessages = [
		{ command: 'keyDownForward', 	state: joystickInputMap.forward.state, 	lastState: joystickInputMap.forward.lastState },
		{ command: 'keyDownBackward', state: joystickInputMap.backward.state, lastState: joystickInputMap.backward.lastState },
		{ command: 'keyDownLeft', 		state: joystickInputMap.left.state, 		lastState: joystickInputMap.left.lastState },
		{ command: 'keyDownRight', 		state: joystickInputMap.right.state, 		lastState: joystickInputMap.right.lastState }
	]
	const keyUpMessages = [
		{ command: 'keyUpForward', 		state: joystickInputMap.forward.state, 	lastState: joystickInputMap.forward.lastState },
		{ command: 'keyUpBackward', 	state: joystickInputMap.backward.state, lastState: joystickInputMap.backward.lastState },
		{ command: 'keyUpLeft', 			state: joystickInputMap.left.state, 		lastState: joystickInputMap.left.lastState },
		{ command: 'keyUpRight', 			state: joystickInputMap.right.state, 		lastState: joystickInputMap.right.lastState }
	]

	keyDownMessages.forEach(({ state, lastState, command }) => {
		if (state && !lastState)
			ws.send(JSON.stringify({ command: command, type: 'input', state: 'down' }))
	})
	keyUpMessages.forEach(({ state, lastState, command }) => {
		if (!state && lastState)
			ws.send(JSON.stringify({ command: command, type: 'input', state: 'up' }))
	})

	joystickInputMap.forward.lastState = joystickInputMap.forward.state
	joystickInputMap.backward.lastState = joystickInputMap.backward.state
	joystickInputMap.left.lastState = joystickInputMap.left.state
	joystickInputMap.right.lastState = joystickInputMap.right.state
})

joystickManager.on('end', (evt, data) => {
	ws.send(JSON.stringify({ command: 'keyUpAll', type: 'input', state: 'up' }))

	joystickInputMap.forward.state = false
	joystickInputMap.backward.state = false
	joystickInputMap.left.state = false
	joystickInputMap.right.state = false

	joystickInputMap.forward.lastState = false
	joystickInputMap.backward.lastState = false
	joystickInputMap.left.lastState = false
	joystickInputMap.right.lastState = false
})
