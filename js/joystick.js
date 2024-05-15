const joystickInput = {
	forward: { state: false, lastState: false },
	backward: { state: false, lastState: false },
	left: { state: false, lastState: false },
	right: { state: false, lastState: false },
	sprint: { state: false, lastState: false },
}

const options = {
	zone: document.getElementById('joystick-div'),
	color: 'red',
	size: 150,
}
const manager = nipplejs.create(options)

manager.on('move', (evt, data) => {
	const degree = data.angle.degree

	if (data.distance < 10)
		return;

	// Sprint
	if (data.distance > 55) {
		joystickInput.sprint.state = true

		if (!joystickInput.sprint.lastState)
			ws.send(JSON.stringify({ message: 'keyDownSprint', type: 'input', state: 'down' }))
	}
	else {
		joystickInput.sprint.state = false

		if (joystickInput.sprint.lastState)
			ws.send(JSON.stringify({ message: 'keyUpSprint', type: 'input', state: 'up' }))
	}
	joystickInput.sprint.lastState = joystickInput.sprint.state

	// Determine quadrant (For right, account for 0 / 360 degree math)
	joystickInput.forward.state = (degree < 145 && degree > 35 && data.distance > 15)
	joystickInput.backward.state = (degree < 325 && degree > 215 && data.distance > 15)
	joystickInput.left.state = (degree < 235 && degree > 125 && data.distance > 15)
	joystickInput.right.state = ((degree < 360 && degree > 305) || (degree < 55 && degree >= 0) && data.distance > 15)

	const keyDownMessages = [
		{ state: joystickInput.forward.state, lastState: joystickInput.forward.lastState, message: 'keyDownForward' },
		{ state: joystickInput.backward.state, lastState: joystickInput.backward.lastState, message: 'keyDownBackward' },
		{ state: joystickInput.left.state, lastState: joystickInput.left.lastState, message: 'keyDownLeft' },
		{ state: joystickInput.right.state, lastState: joystickInput.right.lastState, message: 'keyDownRight' }
	]
	const keyUpMessages = [
		{ state: joystickInput.forward.state, lastState: joystickInput.forward.lastState, message: 'keyUpForward' },
		{ state: joystickInput.backward.state, lastState: joystickInput.backward.lastState, message: 'keyUpBackward' },
		{ state: joystickInput.left.state, lastState: joystickInput.left.lastState, message: 'keyUpLeft' },
		{ state: joystickInput.right.state, lastState: joystickInput.right.lastState, message: 'keyUpRight' }
	]

	keyDownMessages.forEach(({ state, lastState, message }) => {
		if (state && !lastState)
			ws.send(JSON.stringify({ message, type: 'input', state: 'down' }))
	})
	keyUpMessages.forEach(({ state, lastState, message }) => {
		if (!state && lastState)
			ws.send(JSON.stringify({ message, type: 'input', state: 'up' }))
	})

	joystickInput.forward.lastState = joystickInput.forward.state
	joystickInput.backward.lastState = joystickInput.backward.state
	joystickInput.left.lastState = joystickInput.left.state
	joystickInput.right.lastState = joystickInput.right.state
})

manager.on('end', (evt, data) => {
	ws.send(JSON.stringify({ message: 'keyUpAll', type: 'input', state: 'up' }))

	joystickInput.forward.state = false
	joystickInput.backward.state = false
	joystickInput.left.state = false
	joystickInput.right.state = false

	joystickInput.forward.lastState = false
	joystickInput.backward.lastState = false
	joystickInput.left.lastState = false
	joystickInput.right.lastState = false
})
