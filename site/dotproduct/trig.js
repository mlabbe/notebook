let a = null;
let b = null;
let pick_tool = null;

function setup() {
    setupCommon();

    mid = createVector(width/2, height/2);
    a = new sketchVectorFromVec(createVector(120, 0), getNextColor(), 1.0, true, "a");
    b = new sketchVectorFromVec(createVector(0, 120), getNextColor(), 1.0, true, "b");

    pick_tool = new pickTool();
    pick_tool.clickables = [a, b];
}

function mousePressed() {
    pick_tool.mousePressed();
}

function mouseReleased() {
    pick_tool.mouseReleased();
}

function touchMoved() {
    return pick_tool.shouldPreventScrolling();
}

function draw() {
    drawGrid();

    pick_tool.setCursor();

    let selected_vec = pick_tool.getCurrentSelection();
    if (selected_vec != null) {
        selected_vec.vec = centeredPVectorFromMouse();
    }

    
    //
    // actual math here
    //

    // vectors are not normalized, so must device by length
    // of a * b
    let length = a.vec.mag() * b.vec.mag();
        
    let cos_theta = p5.Vector.dot(a.vec, b.vec) / length;
    let radians = Math.acos(cos_theta);
    let degrees = radians * (180 / Math.PI);

    //
    // graph 'em
    //
    a.drawCentered(pick_tool.getCurrentSelection() === a);
    b.drawCentered(pick_tool.getCurrentSelection() === b);

    drawTextBackground(4);
    printScalar(1, a.col, cos_theta, "cos θ");
    printScalar(2, a.col, radians, "radians");
    printScalar(3, a.col, degrees, "degrees");

    fill(b.col);
    stroke(192);
    let angle_type = "";

    if (degrees < 90) {
        angle_type = "acute";
    } else if (degrees.toFixed(0) == 90) {
        angle_type = "right";
    } else {
        angle_type = "obtuse";
    }
    text(angle_type, VALUE_COLUMN, getTextY(4));
}