const movementJoystickInputMap = {
	forward: 	{ state: false, lastState: false },
	backward: { state: false, lastState: false },
	left: 		{ state: false, lastState: false },
	right: 		{ state: false, lastState: false },
	sprint: 	{ state: false, lastState: false },
}

const movementJoystickOptions = {
	zone: document.getElementById('movement-joystick-div'),
	color: 'red',
	size: 150,
	mode: 'semi',
	catchDistance: 100,
}
const movementJoystickManager = nipplejs.create(movementJoystickOptions)

movementJoystickManager.on('move', (evt, data) => {
	const degree = data.angle.degree

	if (data.distance < 10)
		return;

	// Sprint
	if (data.distance > 55) {
		movementJoystickInputMap.sprint.state = true

		if (!movementJoystickInputMap.sprint.lastState)
			ws.send(JSON.stringify({ command: 'keyDownRun', type: 'input', state: 'down' }))
	}
	else {
		movementJoystickInputMap.sprint.state = false

		if (movementJoystickInputMap.sprint.lastState)
			ws.send(JSON.stringify({ command: 'keyUpRun', type: 'input', state: 'up' }))
	}
	movementJoystickInputMap.sprint.lastState = movementJoystickInputMap.sprint.state

	// Determine quadrant (For right, account for 0 / 360 degree math)
	// 110° per quadrant, 20° for diagonal overlap
	movementJoystickInputMap.forward.state = 	(degree < 145 && degree > 35 && data.distance > 15)
	movementJoystickInputMap.backward.state = (degree < 325 && degree > 215 && data.distance > 15)
	movementJoystickInputMap.left.state = 		(degree < 235 && degree > 125 && data.distance > 15)
	movementJoystickInputMap.right.state = 		((degree < 360 && degree > 305) || (degree < 55 && degree >= 0) && data.distance > 15)

	const keyDownMessages = [
		{ command: 'keyDownMoveForward', 	state: movementJoystickInputMap.forward.state, 	lastState: movementJoystickInputMap.forward.lastState },
		{ command: 'keyDownMoveBackward', state: movementJoystickInputMap.backward.state, lastState: movementJoystickInputMap.backward.lastState },
		{ command: 'keyDownMoveLeft', 		state: movementJoystickInputMap.left.state, 		lastState: movementJoystickInputMap.left.lastState },
		{ command: 'keyDownMoveRight', 		state: movementJoystickInputMap.right.state, 		lastState: movementJoystickInputMap.right.lastState }
	]
	const keyUpMessages = [
		{ command: 'keyUpMoveForward', 		state: movementJoystickInputMap.forward.state, 	lastState: movementJoystickInputMap.forward.lastState },
		{ command: 'keyUpMoveBackward', 	state: movementJoystickInputMap.backward.state, lastState: movementJoystickInputMap.backward.lastState },
		{ command: 'keyUpMoveLeft', 			state: movementJoystickInputMap.left.state, 		lastState: movementJoystickInputMap.left.lastState },
		{ command: 'keyUpMoveRight', 			state: movementJoystickInputMap.right.state, 		lastState: movementJoystickInputMap.right.lastState }
	]

	keyDownMessages.forEach(({ state, lastState, command }) => {
		if (state && !lastState)
			ws.send(JSON.stringify({ command: command, type: 'input', state: 'down' }))
	})
	keyUpMessages.forEach(({ state, lastState, command }) => {
		if (!state && lastState)
			ws.send(JSON.stringify({ command: command, type: 'input', state: 'up' }))
	})

	movementJoystickInputMap.forward.lastState = movementJoystickInputMap.forward.state
	movementJoystickInputMap.backward.lastState = movementJoystickInputMap.backward.state
	movementJoystickInputMap.left.lastState = movementJoystickInputMap.left.state
	movementJoystickInputMap.right.lastState = movementJoystickInputMap.right.state
})

movementJoystickManager.on('end', (evt, data) => {
	ws.send(JSON.stringify({ command: 'keyUpAll', type: 'input', state: 'up' }))

	movementJoystickInputMap.forward.state = false
	movementJoystickInputMap.backward.state = false
	movementJoystickInputMap.left.state = false
	movementJoystickInputMap.right.state = false

	movementJoystickInputMap.forward.lastState = false
	movementJoystickInputMap.backward.lastState = false
	movementJoystickInputMap.left.lastState = false
	movementJoystickInputMap.right.lastState = false
})

const cameraJoystickOptions = {
	zone: document.getElementById('camera-joystick-div'),
	color: 'red',
	size: 200,
	lockX: true,
	mode: 'semi',
	catchDistance: 100,
}
const cameraJoystickManager = nipplejs.create(cameraJoystickOptions)

cameraJoystickManager.on('move', (evt, data) => {
	ws.send(JSON.stringify({ command: 'joystickHorizontal', type: 'input', value: data.vector.x }))
})

cameraJoystickManager.on('end', (evt, data) => {
	ws.send(JSON.stringify({ command: 'joystickHorizontal', type: 'input', value: 0 }))
})
