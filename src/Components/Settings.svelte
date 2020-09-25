<script>
  export let snake;

  $: {
    if (snake.gameboard.size > 15) {
      snake.gameboard.size = 15
    } else if (snake.gameboard.size < 5) {
      snake.gameboard.size = 5
    }

    if (snake.gameboard.candySpawn > 100) {
      snake.gameboard.candySpawn = 100
    } else if (snake.gameboard.candySpawn < 1) {
      snake.gameboard.candySpawn = 1
    }

    if (snake.speed > 10) {
      snake.speed = 10
    } else if (snake.speed < 1) {
      snake.speed = 1
    }
  }
</script>

<style>
  #settings {
    width: 100%;
    height: min-content;
    text-align: center;
  }

  h2 {
    font-weight: 200;
  }

  p {
    font-weight: 100;
  }
</style>

<div id="settings">
  <h2>Game Settings</h2>
  <div>
    <p>Size (5 - 15) :</p><input
      type="number"
      bind:value={snake.gameboard.size} />
  </div>
  <div>
    <p>Speed (1 - 10) :</p><input type="number" bind:value={snake.speed} />
  </div>
  <div>
    <p>Candy spawn (1 - 100) :</p><input
      type="number"
      bind:value={snake.gameboard.candySpawn} />
  </div>
</div>
