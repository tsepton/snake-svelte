<script>
  export let snake;
</script>

<style>
  #settings {
    width: 100%;
    height: min-content;
    text-align: center;
  }

  h2 {
    font-weight: 100;
  }
</style>

<div id="settings">
  <h2>Game Settings</h2>
  <div>
    <p>Size (5 - 15) :</p><input type="number" bind:value={snake.gameboard.size} />
  </div>
  <div>
    <p>Speed (1 to 5) :</p><input type="number" bind:value={snake.speed}/>
  </div>
  <div>
    <p>Candy spawn (1 - 100) :</p><input type="number" bind:value={snake.gameboard.candySpawn} />
  </div>
</div>
