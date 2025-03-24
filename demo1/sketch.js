let depth = 8;
let angle = 25;
let len = 150;
let hueOffset = 0;
let fractalType = 'tree';

function setup() {
    createCanvas(800, 800);
    angleMode(DEGREES);
    strokeWeight(2);
    colorMode(HSB, 360, 100, 100);

    // 添加控制器事件监听
    document.getElementById('fractalType').addEventListener('change', function() {
        fractalType = this.value;
    });
    document.getElementById('depth').addEventListener('input', function() {
        depth = parseInt(this.value);
    });
    document.getElementById('angle').addEventListener('input', function() {
        angle = parseInt(this.value);
    });
    document.getElementById('length').addEventListener('input', function() {
        len = parseInt(this.value);
    });
}

function draw() {
    background(240, 10, 95);
    hueOffset = (hueOffset + 0.5) % 360;

    switch(fractalType) {
        case 'tree':
            translate(width/2, height);
            drawTree(len, depth);
            break;
        case 'koch':
            translate(width/2, height/2);
            drawKoch();
            break;
        case 'sierpinski':
            translate(width/2, height/2);
            drawSierpinski();
            break;
    }
}

function drawTree(len, n) {
    // 根据递归深度和长度设置更丰富的颜色
    let hue = (hueOffset + map(n, 0, depth, 0, 360)) % 360;
    let saturation = map(len, 50, 150, 90, 100);
    let brightness = map(n, 0, depth, 100, 85) + random(-5, 5);
    stroke(hue, saturation, brightness);
    
    // 绘制当前分支
    line(0, 0, 0, -len);

    if (n > 0) {
        // 移动到分支末端
        translate(0, -len);

        // 左分支
        push();
        rotate(-angle);
        drawTree(len * 0.7, n - 1);
        pop();

        // 右分支
        push();
        rotate(angle);
        drawTree(len * 0.7, n - 1);
        pop();
    }
}

function drawKoch() {
    let size = len * 2;
    push();
    rotate(180);
    for (let i = 0; i < 3; i++) {
        koch(size, depth);
        rotate(120);
    }
    pop();
}

function koch(len, n) {
    let hue = (hueOffset + map(n, 0, depth, 0, 360)) % 360;
    stroke(hue, 90, 95);

    if (n === 0) {
        line(0, 0, len, 0);
        translate(len, 0);
    } else {
        len /= 3;
        koch(len, n - 1);
        rotate(-60);
        koch(len, n - 1);
        rotate(120);
        koch(len, n - 1);
        rotate(-60);
        koch(len, n - 1);
    }
}

function drawSierpinski() {
    let size = len * 2;
    let h = size * sqrt(3) / 2;
    
    push();
    translate(-size/2, -h/2);
    sierpinski(0, 0, size, depth);
    pop();
}

function sierpinski(x, y, size, n) {
    let hue = (hueOffset + map(n, 0, depth, 0, 360)) % 360;
    stroke(hue, 90, 95);
    noFill();

    if (n > 0) {
        let h = size * sqrt(3) / 2;
        
        // 绘制三角形
        triangle(x, y, x + size, y, x + size/2, y - h);
        
        // 递归绘制三个小三角形
        size /= 2;
        h = size * sqrt(3) / 2;
        sierpinski(x, y, size, n - 1);
        sierpinski(x + size * 3/2, y, size, n - 1);
        sierpinski(x + size * 3/4, y - h, size, n - 1);
    }
}