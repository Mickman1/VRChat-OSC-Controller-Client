const inputMap = {
	KeyW: 			{ command: 'Forward', 	state: false },
	KeyS: 			{ command: 'Backward', 	state: false },
	KeyA: 			{ command: 'Left', 			state: false },
	KeyD: 			{ command: 'Right', 		state: false },
	ShiftLeft: 	{ command: 'Sprint', 		state: false },
	Space: 			{ command: 'Jump', 			state: false },
	KeyJ: 			{ command: 'HoldFB', 		state: false },
	KeyV: 			{ command: 'Voice', 		state: false },
	ArrowLeft: 	{ command: 'LookLeft', 	state: false },
	ArrowRight: { command: 'LookRight', state: false },
}

let ws = new WebSocket('wss://mickbot.com/ws')

ws.onclose = function() {
	reconnectWebSocket()
}

let pingInterval
ws.onopen = function() {
	console.log('WebSocket OPENED')

	pingInterval = setInterval(function() {
		ping()
	}, 5000)
}

document.addEventListener('keydown', function(event) {
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
	if (ws.readyState !== WebSocket.OPEN) {
		reconnectWebSocket()
	}
}

function reconnectWebSocket() {
	console.log('WebSocket was CLOSED, re-opening...')

	ws = new WebSocket('wss://mickbot.com/ws')
}

function ping() {
	ws.send(JSON.stringify({ message: 'ping', type: 'ping' }))
}
