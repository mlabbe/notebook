let mid = null;
let a = null;
let pick_tool = null;
draw_labels_on_sketch_vectors = true;

function setup() {
    setupCommon();
    
    mid = createVector(width/2, height/2);    
    a = new sketchVectorFromVec(createVector(100, -100),
        getNextColor(), 1.0, true, "a");

    pick_tool = new pickTool();
    pick_tool.clickables = [a];
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

    let selected_vec = pick_tool.getCurrentSelection();
    if (selected_vec != null) {        
        selected_vec.vec = centeredPVectorFromMouse();
    }

    pick_tool.setCursor();

    //
    // actual math here
    //
    let length = Math.sqrt(p5.Vector.dot(a.vec, a.vec));

    //
    // graph 'em
    //
    a.drawCentered(pick_tool.getCurrentSelection() == a);    

    drawTextBackground(2);
    a.printVec2(1);    
    printScalar(2, a.col, length, "sqrt(dot(a, a))");    
}