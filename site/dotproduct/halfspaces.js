let a_degrees = 0;
let b_degrees = 0;
let b_magnitude = 5;

function rotate_vec_2d(v, rad) {
    return createVector(
        v.x * Math.cos(rad) - v.y * Math.sin(rad),
        v.x * Math.sin(rad) + v.y * Math.cos(rad)
    );
}

function setup() {
    createCanvas(640, 480);
    

    cursor(CROSS);
}


function drawCenteredVec(v, scale, is_selected) {
    if (is_selected)
        strokeWeight(3);
    else
        strokeWeight(1);

    let w = p5.Vector.mult(v, scale);
    
    let mid = createVector(width/2, height/2);
    line(mid.x, mid.y,
           w.x + mid.x, w.y + mid.y);

    strokeWeight(1);
}

function radiansFromMousePosition(coord) {
    let x = coord / width;

    if (x < 0) {
        x = 0;
    } else if (x > 1) {
        x = 1;
    }

    return x * 6.28319;
}

function printVec2(name, v, offset) {
    text(name + " [" + v.x.toFixed(2) + ", " + v.y.toFixed(2) + "]", 10, 10 + (offset * 15));
}

function draw() {
    clear();

    a_degrees = radiansFromMousePosition(mouseX);
    b_degrees = radiansFromMousePosition(mouseY);    

    a = createVector(1, 0);
    a = rotate_vec_2d(a, a_degrees);
        
    b = createVector(1, 0);
    b = rotate_vec_2d(b, b_degrees);
    b.mult(b_magnitude);

    a_dot_b = p5.Vector.dot(a, b);

    stroke(255, 0, 0);
    drawCenteredVec(a, 50.0, false);

    noStroke();
    text(a_dot_b.toFixed(2), 10, 10);

    stroke(255, 0, 0);
    printVec2("a (normalized)", a, 1);     

    stroke(0, 0, 255);
    printVec2("b", b, 2);    
    drawCenteredVec(b, 25.0, false);

}