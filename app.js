// window 
let board;
let board_h = 600;
let board_w = 400;
let context;

// sounds
let slap_sfx = new Audio('assets/slap.wav')
let woosh_sfx = new Audio('assets/woosh.wav')
let score_sfx = new Audio('assets/score.wav')

// player
let player_w = 57;
let player_h = 58;
let player_x = 172;
let player_y = 300;
let velocity = 0;

// Pipes
let pipe_w = 79;
let pipe_h = 360;
let pipe_x = 400;
let pipe_y = getRandomInt(30, 280);
let gap = 250;
let p_velocity = -1.2;
let pipe_scored = false

// Game Variables
let score = 0;

let bg_x_pos = -1;
let ground_x_pos = 0;
let bg_scroll_spd = 0.5;
let ground_scroll_spd = 1;
let bg_width = 400;

let has_moved = false;


let player = {
  x : player_x,
  y : player_y,
  width : player_w,
  height : player_h
};

window.onload = function() {
  board = document.getElementById("board");
  board.height = board_h;
  board.width = board_w;
  context = board.getContext("2d");

  // BackGround
  bg_img = new Image();
  bg_img.src = "assets/background.png";
  bg_img.onload = function() {
    context.drawImage(bg_img, 0, 0, 400, 600);
  }

  // Player
  player_img = new Image();
  player_img.src = "./assets/player.png";
  player_img.onload = function() {
    context.drawImage(player_img, player.x, player.y, player.width, player.height);
  }

  // Ground
  ground_img = new Image();
  ground_img.src = "./assets/ground.png";
  ground_img.onload = function() {
    context.drawImage(ground_img, 0, 525, 400, 75);
  }

  // Pipes
  pipe_up_img = new Image();
  pipe_up_img.src = "assets/pipe_up.png";
  pipe_up_img.onload = function() {
    context.drawImage(pipe_up_img, 200, 350, 79, 300);
  }

  pipe_down_img = new Image();
  pipe_down_img.src = "assets/pipe_down.png";
  pipe_down_img.onload = function() {
    context.drawImage(pipe_down_img, 200, 0, 79, 300);
  }

  // Start animation loop
  requestAnimationFrame(update)
};

function update() {
    // clearning the canvas
    context.clearRect(0, 0, board_w, board_h);


    // Background & Ground Scrolling
    bg_x_pos -= bg_scroll_spd
    ground_x_pos -= ground_scroll_spd

    // Redrawing the background image according to the new (x, y) values
    context.drawImage(bg_img, bg_x_pos, 0, bg_width, board_h);
    context.drawImage(bg_img, bg_x_pos + bg_width, 0, bg_width, board_h);

    // Redrawing the player image again
    context.drawImage(player_img, player.x, player.y, player.width, player.height);

    // Reset background position for infinite scroll
    if (bg_x_pos <= -bg_width) {
        bg_x_pos = 0;
    }

    // Redrawing the ground again using new (x, y) values
    context.drawImage(ground_img, ground_x_pos, 525, 400, 75);
    context.drawImage(ground_img, ground_x_pos + bg_width, 525, 400, 75);

    // Reset ground position for infinite scroll
    if (ground_x_pos <= -bg_width) {
        ground_x_pos = 0;
    }

    // Main movement logic
    if (has_moved == true) {
    velocity += 0.25 // Value is less then it goes up, as in browsers use y axis is opposite
    player.y += velocity
    
    // Move Pipes
    pipe_x += p_velocity 
    }

    // Calls the respawn function asap until pipe go out the screen
    if (pipe_x < -pipe_w) {
      pipe_respawn();
    }

    // Top pipe (flipped one)
    context.drawImage(pipe_down_img, pipe_x, pipe_y - pipe_h, pipe_w, pipe_h);

    // Bottom pipe
    context.drawImage(pipe_up_img, pipe_x, pipe_y + gap, pipe_w, pipe_h);

    // Start game on any key press, then only space works
    document.addEventListener("keydown", jump);

    // Reset Player if too high or too low
    if (player.y < -64 || player.y > 536) {
      	game_over();
    }

    // Score card
    context.fillStyle = "White";
    context.font = "60px Reg";
    context.fillText(score, 181, 80);
    
    // Increasing the Score
	if (pipe_scored == false && player.x > pipe_x) {
		score += 1
		pipe_scored = true
		score_sfx.play()
    }

    // Check if player is touching Pipe
    if (
      checkCollision(player.x + 3, player.y + 3, 52, 52, pipe_x, pipe_y - 360, 79, 360) ||
      checkCollision(player.x + 3, player.y + 3, 52, 52, pipe_x, pipe_y + gap, 79, 360)
    ) {
      game_over();
    }
    // Recalling it so animation never stops kinda infite loop
    requestAnimationFrame(update);
};

// Respawn the pipe as soon as it's out of the screen
function pipe_respawn() {
  pipe_x = 400;
  pipe_y = getRandomInt(30, 280);
  pipe_scored = false;
};


// Getting the random integer
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
};

// Handeling the jump
function jump(key) {
  if (has_moved == false) {
    has_moved = true;
  }

  velocity = -6; // makes it move up not down
  woosh_sfx.currentTime = 0;
  woosh_sfx.play();
};

// Handle phone tap
document.addEventListener("touchstart", function () {
  jump();
});

// handel the key press
document.addEventListener("keydown", function (key) {
  if (key.code === "Space") {
    jump();
  }
});

// Gameover and reset everything
function game_over() {
  player.x = 172;
  player.y = 300;
  score = 0;
  has_moved = false;
  pipe_reset();
  slap_sfx.play();
};

// Reset pipes
function pipe_reset(){
  pipe_x = 600;
  pipe_y = getRandomInt(30, 280);
  pipe_scored = false;
};

// Here we are checking overlapping (collisons) so not touch and everything should satfiy at once
function checkCollision(x1,y1,w1,h1, x2,y2,w2,h2) {
	return (
        x1 < x2+w2 &&
		x2 < x1+w1 &&
		y1 < y2+h2 &&
		y2 < y1+h1
    );
};


// ------------------------------------------------------------LOGIC--------------------------------------------------------------------

// Pure Logic for Collision Detection (Box vs Box)

// We're assuming 2 boxes:
// Each has position (x, y) and dimensions (width, height) (w, h)

// box1
// x1 = 10, y1 = 10, w1 = 20, h1 = 20.
// box2
// x2 = 25, y2 = 15, w2 = 20, h2 = 20.

// -------------------------------------------------------------------------------------------------------------------------------------

// --- Calculating Sides ---


// Box 1
// Left   = x1          = 10
// Right  = x1 + w1     = 30
// Top    = y1          = 10
// Bottom = y1 + h1     = 30


// Box 2
// Left   = x2          = 25
// Right  = x2 + w2     = 45
// Top    = y2          = 15
// Bottom = y2 + h2     = 35

// -------------------------------------------------------------------------------------------------------------------------------------

// --- Collision Logic ---

// Collision happens when boxes **overlap** both **horizontally and vertically**.


// like opp sides left of the something right of the something so,
// So we check 4 things:
// Two for horizontal overlap
// Two for vertical overlap

// 1. Horizontal overlap:
// Box1's Left < Box2's Right → x1 < x2 + w2
// Box2's Left < Box1's Right → x2 < x1 + w1

// 2. Vertical overlap:
// Box1's Top < Box2's Bottom → y1 < y2 + h2
// Box2's Top < Box1's Bottom → y2 < y1 + h1

// If all 4 are true → boxes are colliding

// -------------------------------------------------------------------------------------------------------------------------------------

// ASCII Diagrams

// X-Axis

// X → ---------------------------------------
//      0      10        25     30       45
//            |---------|.       → box1 (10 to 25)
//            |         |.|------------| → box2 (25 to 35)
//            |         |.|            |
//            |         |.|            |
//            |---------|.|            |
//                        |------------|

// From 25 to 30, both boxes overlap

// -------------------------------------------------------------------------------------------------------------------------------------

// Y-Axis

// Y
// ↑
// | 0     (top of screen)
// |
// | 10    |--------------|         ← Box1 (y=10 to 30)
// |       |              |
// | 15    |              |.|--------------| ← Box2 (y=15 to 35)
// |       |              |.|              |
// | 30    |--------------|.|              |       
// |        ↑Bottom of Box1.|              |
// | 35    . . . . . . . . .|--------------| ← Bottom of Box2
// |

// Kinda thery are now overlapping but vertically

// -------------------------------------------------------------------------------------------------------------------------------------

// This technique is known as:
// AABB Collision Detection using Axis Projections

// 1D projection of 2D Axis-Aligned Bounding Box (AABB) Collision Detection

// --------------------------------------------------------------END---------------------------------------------------------------------
