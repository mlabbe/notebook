let mid = null;
let a = null;
let b = null;
let currentlyManipulatedVector = 0;

function setup() {
    createCanvas(640, 480);
    //    noCursor();

    cursor(CROSS);


    mid = createVector(width/2, height/2);
    a = createVector(1, 0);
    b = createVector(mid.x, mid.y);
};

function mouseClicked() {
    if (currentlyManipulatedVector == 0)
        currentlyManipulatedVector = 1;
    else
        currentlyManipulatedVector = 0;

    cursor(CROSS, 0, 0);
};

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
};

function printVec2(name, v, offset) {
    text(name + " [" + v.x.toFixed(2) + ", " + v.y.toFixed(2) + "]", 10, 10 + (offset * 15));
};


function draw() {
    clear();

    if (currentlyManipulatedVector == 0) {
        a = createVector(mouseX - mid.x,
                         mouseY - mid.y);
    } else {
        b = createVector(mouseX - mid.x,
                         mouseY - mid.y);
    }

    //let a = createVector(1, 0);
    
    //let b = createVector(mouseX - mid.x,
    //                     mouseY - mid.y);

    // math here
    a.normalize();
    let signed_length = p5.Vector.dot(a, b);
    let a_dot_b = p5.Vector.mult(a, b);

    // graph 'em
    stroke(255, 0, 0);
    printVec2("a (normalized)", a, 1);    
    drawCenteredVec(a, 40.0, currentlyManipulatedVector == 0);

    stroke(0, 0, 255);
    printVec2("b", b, 2);    
    drawCenteredVec(b, 1.0, currentlyManipulatedVector == 1);

    stroke(0, 255, 0);
    printVec2("a_dot_b", a_dot_b, 3);    
    drawCenteredVec(a_dot_b, 1.0);


    // annotate 'em
    //    noStroke();
    //text('norm a ' + a.x + , 10, 10);

};
