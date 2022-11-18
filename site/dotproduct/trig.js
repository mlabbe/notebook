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

function mouseClicked() {
    pick_tool.mouseClicked();
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
    
    a.drawCentered(pick_tool.getCurrentSelection() === a);
    b.drawCentered(pick_tool.getCurrentSelection() === b);

    fill(a.col);
    noStroke();
    text(cos_theta.toFixed(2) + " cos θ", 10, getTextY(1));
    text(radians.toFixed(2) + " ㎭", 10, getTextY(2));    
    text(degrees.toFixed(2) + "°", 10, getTextY(3));

    fill(b.col);
    let angle_type = "";

    if (degrees < 90) {
        angle_type = "acute";
    } else if (degrees.toFixed(0) == 90) {
        angle_type = "right";
    } else {
        angle_type = "obtuse";
    }
    text(angle_type, 10, getTextY(4));
}