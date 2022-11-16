let mid = null;
let a = null;
let pick_tool = null;

function setup() {
    setupCommon();
    
    mid = createVector(width/2, height/2);    
    a = new sketchVectorFromVec(createVector(0, 0),
        getNextColor(), 1.0, true, "a");

    pick_tool = new pickTool();
    pick_tool.clickables = [a];
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
    let length = Math.sqrt(p5.Vector.dot(a.vec, a.vec));

    a.printVec2(1);
    a.drawCentered(pick_tool.getCurrentSelection() == a);

    noStroke();
    fill(a.col);
    text(length.toFixed(2), 10, getTextY(2));
    stroke(a.col);
    text("sqrt(dot(a, a))", 150, getTextY(2));
}