const inputMap = {
	KeyW: 			{ command: 'MoveForward', 	state: false },
	KeyS: 			{ command: 'MoveBackward', 	state: false },
	KeyA: 			{ command: 'MoveLeft', 			state: false },
	KeyD: 			{ command: 'MoveRight', 		state: false },
	ShiftLeft: 	{ command: 'Run', 					state: false },
	Space: 			{ command: 'Jump', 					state: false },
	KeyJ: 			{ command: 'SpinHoldLeft', 	state: false },
	KeyL: 			{ command: 'SpinHoldRight', state: false },
	KeyI: 			{ command: 'SpinHoldUp', 		state: false },
	KeyK: 			{ command: 'SpinHoldDown', 	state: false },
	KeyU: 			{ command: 'SpinHoldCCW', 	state: false },
	KeyO: 			{ command: 'SpinHoldCW', 		state: false },
	KeyV: 			{ command: 'Voice', 				state: false },
	ArrowLeft: 	{ command: 'LookLeft', 			state: false },
	ArrowRight: { command: 'LookRight', 		state: false },
}

let ws = new WebSocket('wss://mickbot.com/ws')

ws.onclose = function() {
	clearInterval(pingInterval)
	reconnectWebSocket()
}

let pingInterval
ws.onopen = function() {
	console.log('WebSocket OPENED')

	pingInterval = setInterval(function() {
		ping()
	}, 5000)
}

document.addEventListener('click', function(event) {
	if (event.target === document.getElementById('send-btn'))
		sendChatboxMessage()

	if (event.target === document.getElementById('jump-btn')) {
		ws.send(JSON.stringify({ command: 'keyDownJump', type: 'input', state: 'down' }))
		setTimeout(() => {
			ws.send(JSON.stringify({ command: 'keyUpJump', type: 'input', state: 'up' }))
		}, 30)
	}
})

document.addEventListener('wheel', function(event) {
	let command = event.deltaY > 0 ? 'keyDownMoveHoldBackward' : 'keyDownMoveHoldForward'

	ws.send(JSON.stringify({ command: command, type: 'input', state: 'down' }))
})

document.addEventListener('keydown', function(event) {
	// Chatbox input
	if (event.target === document.getElementById('message-box')) {
		if (event.code === 'Enter' || event.code === 'NumpadEnter') {
			// Prevent newline by default in <textarea>
			event.preventDefault()
			sendChatboxMessage()
		}

		return;
	}

	let key = event.code

	// Don't spam WebSocket / OSC with duplicate commands
	if (inputMap[key] && inputMap[key].state === false) {
		let command = `keyDown${inputMap[key].command}`
		inputMap[key].state = true

		ws.send(JSON.stringify({ command: command, type: 'input', state: 'down' }))
	}
})

document.addEventListener('keyup', function(event) {
	if (document.activeElement === document.getElementById('message-box'))
		return;

	let key = event.code

	// Don't spam WebSocket / OSC with duplicate commands
	if (inputMap[key] && inputMap[key].state === true) {
		let command = `keyUp${inputMap[key].command}`
		inputMap[key].state = false
		
		ws.send(JSON.stringify({ command: command, type: 'input', state: 'up' }))
	}
})

function sendChatboxMessage() {
	const chatboxMessage = document.getElementById('message-box').value

	if (chatboxMessage === '')
		return;

	ws.send(JSON.stringify({ chatboxMessage: chatboxMessage, type: 'chatbox' }))

	document.getElementById('message-box').value = ''
}

function checkWebSocketConnection() {
	if (ws.readyState === WebSocket.CLOSED)
		reconnectWebSocket()
}

function reconnectWebSocket() {
	console.log('WebSocket was CLOSED, re-opening...')

	ws = new WebSocket('wss://mickbot.com/ws')
}

function ping() {
	ws.send(JSON.stringify({ message: 'ping', type: 'ping' }))
}
