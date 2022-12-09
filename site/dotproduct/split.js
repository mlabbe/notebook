let a = null;
let b = null;
let b_parallel = null;
let b_perp = null;
let mid = null;

function setup() {
    setupCommon();

    mid = createVector(width/2, height/2);
    a = new sketchVectorFromVec(createVector(1, 0),
        getNextColor(), 50.0, true, "a normalized");
    
    b = new sketchVectorFromVec(createVector(-120, -120),
        getNextColor(), 1.0, true, "b");

    b_parallel = new sketchVectorFromVec(createVector(0,0), 
        getNextColor(), 1.0, false, "b's parallel component");

    b_perp = new sketchVectorFromVec(createVector(0,0),
        getNextColor(), 1.0, false, "b's perpendicular component");

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

    //a.vec = createVector(1, 0);
    
    let selected_vec = pick_tool.getCurrentSelection();
    if (selected_vec != null) {        
        selected_vec.vec = centeredPVectorFromMouse();
    }

    pick_tool.setCursor();

    //
    // actual math here
    //

    a.vec.normalize();  

    // parallel
    let a_dot_b = p5.Vector.dot(a.vec, b.vec);
    b_parallel.vec = p5.Vector.mult(a.vec, a_dot_b);

    // perpendicular
    b_perp.vec = p5.Vector.sub(b.vec, b_parallel.vec);
    

    a.printVec2(1);
    a.drawCentered(pick_tool.getCurrentSelection() == a);


    b.printVec2(2);
    b.drawCentered(pick_tool.getCurrentSelection() == b);

    b_parallel.printVec2(3);
    b_parallel.drawCentered(false);

    b_perp.printVec2(4);
    b_perp.drawCentered(false);

}