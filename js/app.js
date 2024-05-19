const keyStates = {
	forward: false,
	backward: false,
	left: false,
	right: false,
	sprint: false,
	jump: false,
	crouch: false,
	prone: false,
	voice: false,
	lookLeft: false,
	lookRight: false,
}

const keyDownInputMap = {
	KeyW: 			{ input: 'keyDownForward', 		state: 'forward' },
	KeyS: 			{ input: 'keyDownBackward', 	state: 'backward' },
	KeyA: 			{ input: 'keyDownLeft', 			state: 'left'},
	KeyD: 			{ input: 'keyDownRight', 			state: 'right' },
	ShiftLeft: 	{ input: 'keyDownSprint', 		state: 'sprint' },
	Space: 			{ input: 'keyDownJump', 			state: 'jump' },
	KeyC: 			{ input: 'keyDownCrouch', 		state: 'crouch' },
	KeyZ: 			{ input: 'keyDownProne', 			state: 'prone' },
	KeyV: 			{ input: 'keyDownVoice', 			state: 'voice' },
	ArrowLeft: 	{ input: 'keyDownLookLeft', 	state: 'lookLeft' },
	ArrowRight: { input: 'keyDownLookRight', 	state: 'lookRight' },
}

const keyUpInputMap = {
	KeyW: 			{ input: 'keyUpForward', 			state: 'forward' },
	KeyS: 			{ input: 'keyUpBackward', 		state: 'backward' },
	KeyA: 			{ input: 'keyUpLeft', 				state: 'left' },
	KeyD: 			{ input: 'keyUpRight', 				state: 'right' },
	ShiftLeft: 	{ input: 'keyUpSprint', 			state: 'sprint' },
	Space: 			{ input: 'keyUpJump', 				state: 'jump' },
	KeyC: 			{ input: 'keyUpCrouch', 			state: 'crouch' },
	KeyZ: 			{ input: 'keyUpProne', 				state: 'prone' },
	KeyV: 			{ input: 'keyUpVoice', 				state: 'voice' },
	ArrowLeft: 	{ input: 'keyUpLookLeft', 		state: 'lookLeft' },
	ArrowRight: { input: 'keyUpLookRight', 		state: 'lookRight' },
}

let ws = new WebSocket('wss://mickbot.com/ws')

ws.onclose = function() {
	reconnectWebSocket()
}

document.getElementById('message-box').addEventListener('keydown', function(event) {
	// Prevent newline by default in <textarea>
	if (event.code === 'Enter') {
		event.preventDefault()
		sendChatboxMessage(event)
	}
})

document.addEventListener('keydown', function(event) {
	if (document.activeElement === document.getElementById('message-box'))
		return;

	if (keyDownInputMap[event.code] && keyStates[keyDownInputMap[event.code].state] === false) {
		let message = keyDownInputMap[event.code].input
		keyStates[keyDownInputMap[event.code].state] = true

		ws.send(JSON.stringify({ message: message, type: 'input', state: 'down' }))
	}
})

document.addEventListener('keyup', function(event) {
	if (document.activeElement === document.getElementById('message-box'))
		return;

	if (keyUpInputMap[event.code] && keyStates[keyUpInputMap[event.code].state] === true) {
		let message = keyUpInputMap[event.code].input
		keyStates[keyUpInputMap[event.code].state] = false
		
		ws.send(JSON.stringify({ message: message, type: 'input', state: 'up' }))
	}
})

function sendChatboxMessage() {
	if (document.getElementById('message-box').value === '')
		return;

	const message = document.getElementById('message-box').value
	ws.send(JSON.stringify({ message: message, type: 'chatbox' }))

	document.getElementById('message-box').value = ''
}

function checkWebSocketConnection() {
	if (ws.readyState !== WebSocket.OPEN) {
		reconnectWebSocket()
	}
}

function reconnectWebSocket() {
	console.log('WebSocket was CLOSED, re-opening...')

	ws = new WebSocket('wss://mickbot.com/ws')
}
