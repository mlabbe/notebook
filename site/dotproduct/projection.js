let mid = null;
let a = null;
let b = null;
let c_color = null;
let pick_tool = null;

function setup() {
    setupCommon();

    mid = createVector(width/2, height/2);
    a = new sketchVectorFromVec(createVector(1, 0), 
        getNextColor(), 50.0, true, "a normalized");
    b = new sketchVectorFromVec(createVector(-120, 120), 
        getNextColor(), 1.0, true, "b");

    c_color = getNextColor();

    pick_tool = new pickTool();
    pick_tool.clickables = [a, b];
}

function mouseClicked() {

    pick_tool.mouseClicked();
}

function draw() {
    drawGrid();

    let selected_vec = pick_tool.getCurrentSelection();
    if (selected_vec != null) {
        selected_vec.vec = centeredPVectorFromMouse();
    }

    pick_tool.setCursor();
    

    //
    // actual math here
    //
    a.vec.normalize();
    let signed_length = p5.Vector.dot(a.vec, b.vec);
    let a_dot_b = new sketchVectorFromVec(p5.Vector.mult(a.vec, signed_length), 
        c_color, 1.0, false, "a * dot(a, b)");
    

    //
    // graph 'em
    //
    a.printVec2(1);
    a.drawCentered(pick_tool.getCurrentSelection() == a);

    b.printVec2(2);
    b.drawCentered(pick_tool.getCurrentSelection() == b);

    a_dot_b.printVec2(3);
    a_dot_b.drawCentered(false);
}
