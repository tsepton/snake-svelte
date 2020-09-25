<script>
  export let snake;
  export let game;

  let keyPressed;
  let interval;
  let move = () => {
    switch (keyPressed) {
      case "z":
        snake.up();
        break;
      case "s":
        snake.down();
        break;
      case "q":
        snake.left();
        break;
      case "d":
        snake.right();
        break;
    }
    // svelte only renders new assignements...
    snake = snake;
  };

  // handling movements
  document.onkeypress = (e) => {
    keyPressed = e.key;
    move();
    clearInterval(interval);
    interval = setInterval(() => {
      move();
    }, 1000 / game.difficulty);
  };
</script>

<style>
  #gameboard {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  h2 {
    width: 100%;
    font-weight: 200;
    text-align: center;
  }

  .row {
    flex-direction: column;
  }

  .game-square-0 {
    width: 3rem;
    height: 3rem;
    background-color: #40444f;
  }

  .game-square-1 {
    width: 3rem;
    height: 3rem;
    background-color: #535865;
  }

  [head="true"] {
    background-color: #3bb273;
    border-radius: 30px;
  }

  [tail="true"] {
    background-color: #66cc96;
  }

  [candy="true"] {
    background-color: #c45baa;
  }
</style>

<h2>Gameboard</h2>
<div id="gameboard">
  {#each Array(game.size) as _, x}
    <div class={'row'}>
      {#each Array(game.size) as _, y}
        <div
          class={`game-square-${(y + x) % 2}`}
          head={JSON.stringify(snake.head) === JSON.stringify([x, y])}
          tail={snake.tail.includes([x, y])}
          candy={game.candies.includes([x, y])} />
      {/each}
    </div>
  {/each}
</div>
