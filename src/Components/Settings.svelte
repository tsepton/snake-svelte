<script>
  //export let snake;
  export let game;
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
    <p>Difficulty :</p><input type="number" bind:value={game.difficulty} />
  </div>
  <div>
    <p>Size :</p><input type="number" bind:value={game.size} />
  </div>
</div>
