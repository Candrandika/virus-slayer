const virusImage = new Image();
virusImage.src = "images/covid.png";
const dImage = new Image();
dImage.src = "images/pad_d.png";
const fImage = new Image();
fImage.src = "images/pad_f.png";
const jImage = new Image();
jImage.src = "images/pad_j.png";
const kImage = new Image();
kImage.src = "images/pad_k.png";

window.onload = function() {
    const splash = document.getElementById("splash");
    const over_screen = document.getElementById("over_screen");
    const pause_screen = document.getElementById("pause_screen");
    const input_username = document.getElementById("input_username");
    const btn_play = document.getElementById("btn_play");
    const left_area = document.getElementById("left");
    const right_area = document.getElementById("right");
    const btn_pause = document.getElementById("pause");
    const btn_resume = document.getElementById("resume");
    const btn_quit = document.querySelectorAll("#quit");
    const show_hs = document.getElementById("show_highscore");
    const hs_dialog = document.getElementById("hs_dialog");
    const hs_username = document.getElementById("hs_username");
    const hs_score = document.getElementById("hs_score");
    const hs_time = document.getElementById("hs_time");

    const v_username = document.getElementById("username");
    const v_score = document.getElementById("score");
    const v_timer = document.getElementById("timer");
    const v_health = document.getElementById("health");
    const v_last_score = document.getElementById("last_score");
    const v_last_time = document.getElementById("last_time");

    const game = document.getElementById("game");
    const ctx = game.getContext("2d");
    game.width = 400;
    game.height = 600;

    var intervalUpdate;
    var intervalTimer;
    var intervalView;
    var intervalEnemy;
    var timeoutCountdown;

    var sec = 0;
    var ms = 0;

    var isClick = "";
    var timeoutClick;
    var cdTime = 3;

    var mili = 0;
    var secon = 0;

    var enemies = [];
    var bullets = [];

    var score = 0;
    var username = "";
    var timer = "";
    var health = 5

    var isPlay = false;
    var isDie = false;

    var hs;

    class Enemy {
        constructor(pos, image) {
            this.x = pos;
            this.img = image
            this.y = 0;
            this.ratio = 0.05;
        }
        update() {
            this.y += 3;
        }
        draw(context) {
            // context.beginPath();
            context.drawImage(this.img, this.x, this.y, this.img.width*this.ratio, this.img.height*this.ratio);
            // context.closePath();
        }
    }
    class Bullet {
        constructor(pos) {
            this.x = pos;
            this.y = game.height;
            this.yt = this.y+20;
            this.lw = 3;
            this.color = "yellow"
        }
        update() {
            this.y -= 5;
            this.yt = this.y+20;
        }
        draw(context) {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x, this.yt);
            context.lineWidth = this.lw;
            context.strokeStyle = this.color;
            context.stroke();
            context.closePath();
        }
    }

    var dpad = {
        img: dImage,
        pos: 30,
        xrec: 0
    }
    var fpad = {
        img: fImage,
        pos: 130,
        xrec: 100
    }
    var jpad = {
        img: jImage,
        pos: 230,
        xrec: 200
    }
    var kpad = {
        img: kImage,
        pos: 330, 
        xrec: 300
    }

    document.addEventListener("keyup", controller)

    btn_play.addEventListener("click", checkingStart);
    btn_pause.addEventListener("click", pause);
    btn_resume.addEventListener("click", checkingStart);
    btn_quit.forEach((btn) => {
        btn.addEventListener("click", quitGame);
    })
    show_hs.addEventListener("click", () => {
        hs_dialog.show();
    })
    get_highscore();
    
    // play();
    function checkingStart() {
        if(input_username.value == "") {
            alert('Fill out the username input before you play!')
        } else {
            username = input_username.value;
            v_username.innerHTML = "Name: "+username;
            if(!timeoutCountdown) countdown();
        }
    }

    // countdown
    function countdown() {
        clearTimeout(timeoutCountdown);
        timeoutCountdown = null;
        gameDisplay();
        drawBackground();
        drawText(cdTime, game.width/2-20, game.height/2, "50px", "sans-serif", "white");
        if(cdTime == 0) {
            cdTime = 3;
            play();
        } else {
            cdTime--;
            timeoutCountdown = setTimeout(countdown, 1000)
        }
    }

    // main function
    function play() {
        gameDisplay();
        intervalUpdate = setInterval(update, 1);
        intervalEnemy = setInterval(addEnemy, 1000);
        intervalView = setInterval(updateView, 1);
        intervalTimer = setInterval(timerStart, 10);
        isPlay = true;
    }
    function update() {
        drawBackground();
        clearBullet();
        clearEnemy();
        checkCollision();
    }
    function pause() {
        clearInterval(intervalUpdate)
        clearInterval(intervalEnemy)
        clearInterval(intervalView)
        clearInterval(intervalTimer)
        clearTimeout(timeoutCountdown)
        timeoutCountdown = null;
        btn_pause.style.display = "none";
        isPlay = false;
        pause_screen.style.display = "grid";
    }
    function updateView() {
        v_health.innerHTML = "Health: "+health;
        v_score.innerHTML = "Score: "+score;
        v_timer.innerHTML = "Time: "+timer;
    }
    function timerStart() {
        ms++;
        if(ms < 10) {
            mili = "0"+ms;
        } else if(ms < 100) {
            mili = ms;
        } else {
            sec++;
            ms = 0;
            mili = "0"+ms;
            secon = sec;
        }
        timer = secon+"."+mili;
    }
    function quitGame() {
        setDefault();
        homeDisplay();
    }
    function gameOver() {
        v_last_score.innerHTML = "Your Score : "+score;
        v_last_time.innerHTML = "Time : "+timer;
        var stat = {
            username: username,
            time: timer,
            score: score
        }
        set_highscore(stat);
        setDefault();
        overDisplay();
    }
    function setDefault() {
        clearInterval(intervalUpdate);
        clearInterval(intervalTimer);
        clearInterval(intervalView);
        clearInterval(intervalEnemy);

        sec = 0;
        ms = 0;

        isClick = "";
        timeoutClick;

        mili = 0;
        secon = 0;

        enemies = [];
        bullets = [];

        score = 0;
        username = "";
        timer = "";
        health = 5

        isPlay = false;
        isDie = false;
    }
    function set_highscore(arr) {
        get_highscore();
        if(hs) {
            if(parseInt(hs.score) < arr.score) {
               localStorage.setItem("highscore", JSON.stringify(arr));
               get_highscore();
            } 
        } else {
            localStorage.setItem("highscore", JSON.stringify(arr));
            get_highscore();
        }
    }
    function get_highscore() {
        hs = JSON.parse(localStorage.getItem("highscore"));
        if(hs) {
            hs_username.innerHTML = hs.username;
            hs_time.innerHTML = hs.time;
            hs_score.innerHTML = hs.score;
        }
    }

    // draw function
    function drawBackground() {
        drawRect(0, 0, game.width, game.height, "transparent", "#333", 0);
        drawRect(0, (game.height-100)/2, game.width, (game.height-100)/2, "transparent", "#ff000066", 0);
        drawEnemy();
        drawBullet();
        drawRect(0, game.height-100, game.width, 100, "transparent", "#44dd44", 0);
        drawBorder();
        drawRect(0, game.height-100, game.width, 10, "#aaa", '#888', 2);
        drawClick();
        drawPad();
    } 
    function drawBorder() {
        drawLine(0, 0, 0, game.height, "gray", 1);
        drawLine(100, 0, game.width/4, game.height, "gray", 1);
        drawLine(game.width/2, 0, game.width/2, game.height, "gray", 1);
        drawLine(game.width/4*3, 0, game.width/4*3, game.height, "gray", 1);
        drawLine(game.width, 0, game.width, game.height, "gray", 1);
    }
    function drawPad() {
        var ratio = 0.5;
        drawRectImage(dpad.img, dpad.pos, game.height-75, dpad.img.width*ratio, dpad.img.height*ratio);
        drawRectImage(fpad.img, fpad.pos, game.height-75, fpad.img.width*ratio, fpad.img.height*ratio);
        drawRectImage(jpad.img, jpad.pos, game.height-75, jpad.img.width*ratio, jpad.img.height*ratio);
        drawRectImage(kpad.img, kpad.pos, game.height-75, kpad.img.width*ratio, kpad.img.height*ratio);
    }
    function drawClick() {
        var click;
        if(isClick) {
            if(isClick == "d") {
                click = dpad;
            } else if(isClick == "f") {
                click = fpad;
            } else if(isClick == "j") {
                click = jpad;
            } else if(isClick == "k") {
                click = kpad;
            }
            drawRect(click.xrec, game.height-100, 100, 100, "transparent", "#88ff88", 0);
            // console.log('y')
        }
    }
    function drawLine(sx, sy, ex, ey, color, lw) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.stroke();
        ctx.closePath();
    }
    function drawRect(x, y, w, h, color, fcolor, lw) {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.strokeStyle = color;
        ctx.fillStyle = fcolor;
        ctx.lineWidth = lw;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    function drawRound(x, y, r, rs, re, color, fcolor, lw) {
        ctx.beginPath();
        ctx.arc(x, y, r, rs, re);
        ctx.strokeStyle = color;
        ctx.fillStyle = fcolor;
        ctx.lineWidth = lw;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    function drawRectImage(image, x, y, w, h) {
        ctx.drawImage(image, x, y, w, h);
    }
    function drawText(text, x, y, s, f, color) {
        ctx.font = s+" "+f;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    // set display style
    function homeDisplay() {
        splash.style.display = "flex";
        game.style.display = "none";
        over_screen.style.display = "none";
        pause_screen.style.display = "none";
        left_area.style.filter = "blur(3px)";
        right_area.style.filter = "blur(3px)";
        btn_pause.style.display = "none";
        
    }
    function gameDisplay() {
        splash.style.display = "none";
        game.style.display = "block";
        over_screen.style.display = "none";
        pause_screen.style.display = "none";
        left_area.style.filter = "blur(0)";
        right_area.style.filter = "blur(0)";
        btn_pause.style.display = "block";

    }
    function overDisplay() {
        splash.style.display = "none";
        game.style.display = "block";
        over_screen.style.display = "grid";
        pause_screen.style.display = "none";
        left_area.style.filter = "blur(3px)";
        right_area.style.filter = "blur(3px)";
        btn_pause.style.display = "none";
    }

    // controller function
    function controller(e) {
        var a = 50;
        if(isPlay) {
            if(e.code == "KeyD") {
                clearTimeout(timeoutClick);
                addBullet(a)
                isClick = "d";
                timeoutClick = setTimeout(()=>{isClick = ""},100);
            } else if(e.code == "KeyF") {
                clearTimeout(timeoutClick);
                addBullet(a+100);
                isClick = "f";
                timeoutClick = setTimeout(()=>{isClick = ""},100);
            } else if(e.code == "KeyJ") {
                clearTimeout(timeoutClick);
                addBullet(a+200);
                isClick = "j";
                timeoutClick = setTimeout(()=>{isClick = ""},100);
            } else if(e.code == "KeyK") {
                clearTimeout(timeoutClick);
                addBullet(a+300);
                isClick = "k";
                timeoutClick = setTimeout(()=>{isClick = ""},100);
            } else if(e.code == "Escape") {
                pause();
            }
        } else {
            if(e.code == "Escape") {
                checkingStart();
            }
        }
    }

    // bullet function
    function addBullet(pos) {
        bullets.push(new Bullet(pos))
    }
    function drawBullet() {
        bullets.forEach((b) => {
            b.draw(ctx);
            if(isPlay) b.update();
        })
    }
    function clearBullet() {
        bullets.forEach((b, index) => {
            if(b.y <= 0) bullets.splice(index, 1);
        })
    }

    // enemy function
    function addEnemy() {
        var rand = Math.floor(Math.random()*4)+1;
        var a;
        var b = 20;
        if(rand == 1 ) a = b;
        else if(rand == 2) a = 100+b;
        else if(rand == 3) a = 200+b;
        else if(rand == 4) a = 300+b;
        enemies.push(new Enemy(a, virusImage));
    }
    function drawEnemy() {
        enemies.forEach((e) => {
            e.draw(ctx);
            if(isPlay) e.update();
        })
    }
    function clearEnemy() {
        enemies.forEach((e, index) => {
            if(e.y >= game.height-100) {
                enemies.splice(index, 1);
                health--;
                if(health == 0) {
                    gameOver();
                }
            }
        })
    }

    // collision
    function checkCollision() {
        enemies.forEach((e, index) => {
            if(e.y >= (game.height-100)/2 && e.y <= game.height-100) {
                // console.log(e.x)
                bullets.forEach((b, indexb) => {
                    // drawLine(e.x, e.y+e.img.width*e.ratio, e.x+100, e.y+e.img.width*e.ratio)
                    var ex = e.x-20;
                    var bx = b.x-50;
                    if(ex == bx) {
                        if(e.y <= b.y && e.y+e.img.width*e.ratio >= b.y) {
                            enemies.splice(index, 1);
                            bullets.splice(indexb, 1);
                            score++;
                        }
                    }
                })
            }
        })
    }
}