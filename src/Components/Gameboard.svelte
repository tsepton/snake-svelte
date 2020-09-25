<script>
  export let snake;

  let interval;
  let move = (keyPressed) => {
    switch (keyPressed) {
      case "z":
        snake.move("up");
        break;
      case "s":
        snake.move("down");
        break;
      case "q":
        snake.move("left");
        break;
      case "d":
        snake.move("right");
        break;
    }
    // svelte only renders new assignements...
    snake = snake;
  };

  $: {
    if (snake.gameover) {
      document.onkeypress = (e) => {
        if (e.key === "Enter") {
          snake.reset();
          snake = snake;
        }
      };
      clearInterval(interval);
    } else {
      // handling movements
      document.onkeypress = (e) => {
        move(e.key);
        clearInterval(interval);
        interval = setInterval(() => {
          move(e.key);
        }, 1000 / snake.speed);
      };
    }
  }

  function sameList(list1, list2) {
    return JSON.stringify(list1) === JSON.stringify(list2);
  }
</script>

<style>
  #gameboard {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  h1 {
    padding-top: 100px;
    width: 100%;
    font-weight: 400;
    text-align: center;
  }

  h2 {
    width: 100%;
    font-weight: 200;
    text-align: center;
  }

  h3 {
    width: 100%;
    font-weight: 100;
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

  [head="true"],
  [tail="true"],
  [candy="true"] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  [head="true"]::after {
    content: "";
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 30px;
    background-color: #3bb273;
  }

  [tail="true"]::after {
    content: "";
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 30px;
    background-color: #66cc96;
  }

  [candy="true"]::after {
    content: "";
    border-radius: 30px;
    width: 1.5rem;
    height: 1.5rem;
    background-color: #c45baa;
  }
</style>

<h2>Gameboard</h2>
<h3>Score : {snake.getScore()}</h3>
{#if snake.gameover}
  <h1>Gameover !</h1>
  <h2>Press 'Enter' to play again</h2>
{:else}
  <div id="gameboard">
    {#each Array(snake.gameboard.size) as _, x}
      <div class={'row'}>
        {#each Array(snake.gameboard.size) as _, y}
          <div
            class={`game-square-${(y + x) % 2}`}
            head={sameList(snake.head, [x, y])}
            tail={snake.tail.some((list) => sameList(list, [x, y]))}
            candy={snake.gameboard.candies.some((list) =>
              sameList(list, [x, y])
            )} />
        {/each}
      </div>
    {/each}
  </div>
{/if}
