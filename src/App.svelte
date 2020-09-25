<script>
  import Game from "./game";
  import Snake from "./snake";
  import Settings from "./Components/Settings.svelte";
  import Gameboard from "./Components/Gameboard.svelte";

  let game = new Game(10, 1);
  let snake = new Snake(game, 0, 0);
</script>

<style>
  #screen {
    display: grid;
    align-items: center;
    width: 100%;
    height: 100%;
    grid-gap: 1rem;
    grid-template-columns: 1fr 5fr;
  }

  #settings {
    height: 100%;
    width: 100%;
    background-color: #f5f5f5;
  }

  #gameboard {
    height: 100%;
    width: 100%;
    background-color: #ffff;
  }
</style>

<div id="screen">
  <div id="settings">
    <Settings {snake} {game} />
  </div>
  <div id="gameboard">
    <Gameboard {snake} {game} />
  </div>
</div>
