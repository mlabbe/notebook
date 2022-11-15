let mid = null;
let a = null;
let b = null;
let c_color = null;
let pick_tool = null;

function setup() {
    createCanvas(640, 480);
    cursor(CROSS);

    mid = createVector(width/2, height/2);
    a = new sketchVectorFromVec(createVector(0, 0), getNextColor(), 25.0, true);
    b = new sketchVectorFromVec(createVector(0, 30), getNextColor(), 1.0, true);

    c_color = getNextColor();

    pick_tool = new pickTool();
    pick_tool.clickables = [a, b];

    textSize(18);

}

function mouseClicked() {

    pick_tool.mouseClicked();
}

function draw() {
    drawGrid();

    let selected_vec = pick_tool.getCurrentSelection();
    if (selected_vec != null) {
        selected_vec.vec.x = mouseX - mid.x;
        selected_vec.vec.y = mouseY - mid.y;
    }

    pick_tool.setCursor();
    

    //
    // actual math here
    //
    a.vec.normalize();
    let signed_length = p5.Vector.dot(a.vec, b.vec);
    let a_dot_b = new sketchVectorFromVec(p5.Vector.mult(a.vec, signed_length), c_color, 1.0, false);
    

    //
    // graph 'em
    //
    a.printVec2("a normalized", 1);
    a.drawCentered(pick_tool.getCurrentSelection() == a);

    b.printVec2("b", 2);
    b.drawCentered(pick_tool.getCurrentSelection() == b);

    a_dot_b.printVec2("a * dot(a, b)", 3);
    a_dot_b.drawCentered(false);
}
