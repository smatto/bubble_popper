//get random number between 2 nums
function randNum(min, max) {
    return Math.random() * (max - min) + min;
}

// Get the canvas element
var canvas = document.getElementById("canvas");
// Get 2D context for drawing
var ctx = canvas.getContext("2d");
// create Particle Array
var balls = [];
//particle creation
function createBall(location) {
    balls.push({
        // location
        x: location.x,
        y: location.y,
        //velocity
        vx: randNum(-200, 200),
        vy: randNum(-200, 200),
        //acceleration
        ax: randNum(-150, 150),
        ay: randNum(-150, 150),
        radius: randNum(5, 20),
        color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    });
}

//create 5 balls to start with in random spots
for (var i = 0; i < 5; i++) {
    var initLoc = {
        x: randNum(30, canvas.width - 30),
        y: randNum(30, canvas.height - 30)
    };
    createBall(initLoc);
}

//now make more balls with the mouse
//figure out mouse position
var rect = document.getElementById("canvas").getBoundingClientRect();
// Get canvas offset on page
var offset = {
    x: rect.left,
    y: rect.top
};
//create ball on click
window.onmousedown = function (e) {
    // IE fixer
    e = e || window.event;
    // get event location on page offset by canvas location
    var location = {
        x: e.pageX - offset.x,
        y: e.pageY - offset.y
    };

    createBall(location);
};

// draw all balls
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < balls.length; i++) {
        var p = balls[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
}
//update text info about balls
function updateInfo() {
    document.getElementById("numbers").innerHTML = "Number of balls:" + balls.length;
    if (balls.length == 0) {
        document.getElementById("numbers").innerHTML = "No balls, you win!";
    }
}
//edge collision method for balls on balls, the plus 5 keeps them from getting stuck mostly
function isColliding(a, b) {
    return Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2) <= Math.pow((a.radius + b.radius), 2) + 5;
}
//balls bounce off if they touch, this could be improved for more realistic deflection conserving mass, etc
function bounce(p) {
    p.vx = -p.vx;
    p.vy = -p.vy;
}
//balls shrink and disappear if they touch
var shrink = function (p, force) {
    if (!p || (!force && p.isShrinking) || typeof p.radius == 'undefined') return;
    p.isShrinking = true;
    p.radius -= 1;

    if (p.radius <= 0) {
        balls.splice(balls.indexOf(p), 1);
    } else {
        setTimeout(function () {
            shrink(p, true);
        }, 100);
    }
}

    function asplode(p) {
        shrink(p);
    }
    // animation update loop
    function update() {
        for (var i = 0; i < balls.length; i++) {
            var p = balls[i];
            //set acceleration 
            p.vx += p.ax / FPS;
            p.vy += p.ay / FPS;
            p.x += p.vx / FPS;
            p.y += p.vy / FPS;
            //canvas edge collision detection
            if ((p.x - p.radius) < 0) {
                p.x = p.radius;
                p.vx = -p.vx;
            }
            if ((p.x + p.radius) > canvas.width) {
                p.x = canvas.width - p.radius;
                p.vx = -p.vx;
            }
            if ((p.y - p.radius) < 0) {
                p.y = p.radius;
                p.vy = -p.vy;
            }
            if ((p.y + p.radius) > canvas.height) {
                p.y = canvas.height - p.radius;
                p.vy = -p.vy;
            }
        }
        //collision check on all balls in sequence, could use sector trees for efficiency
        for (var j = 0; j < balls.length; j++) {
            for (var k = j + 1; k < balls.length; k++) {
                if (isColliding(balls[j], (balls[k]))) {
                    bounce(balls[j]);
                    bounce(balls[k]);
                    asplode(balls[j]);
                    asplode(balls[k]);
                }
            }
        }
    }


    //do all the things
    function tick() {
        draw();
        update();
        updateInfo();
    }

    // set frames-per-second for timer
var FPS = 30;
//do it all at this speed
setInterval(tick, 1000 / FPS);