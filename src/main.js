import App from './App.svelte'
import Snake from './snake'
import Gameboard from './gameboard'

let gameboard = new Gameboard(10)
let snake = new Snake(Gameboard, 0, 0)
const app = new App({
	target: document.body,
	props: {
		gameboard: gameboard,
		snake: snake,
	}
})

export default app