let a = null;
let b = null;
let mid = null;

draw_labels_on_sketch_vectors = true;

let positive_color = null;
let negative_color = null;

const SCALE = 50.0;

function rotate_vec_2d(v, rad) {
    return createVector(
        v.x * Math.cos(rad) - v.y * Math.sin(rad),
        v.x * Math.sin(rad) + v.y * Math.cos(rad)
    );
}

function setup() {
    setupCommon();

    mid = createVector(width/2, height/2);
    a = new sketchVectorFromVec(createVector(1, 0), getNextColor(), SCALE, true, "a");
    b = new sketchVectorFromVec(createVector(125, 150), getNextColor(), 1.0, true, "b");

    positive_color = getNextColor();
    negative_color = getNextColor();
    
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
    a.vec.normalize();
    a_dot_b = p5.Vector.dot(a.vec, b.vec);

//    noStroke();

    a.drawCentered(pick_tool.getCurrentSelection() === a);
        
    b.drawCentered(pick_tool.getCurrentSelection() === b);    

    // draw halfspace boundary
    let cross_top = createVector(a.vec.y, -a.vec.x);
    
    cross_top.mult(1000);

    let cross_bottom = createVector(-cross_top.x, -cross_top.y);
    cross_bottom.add(mid);

    cross_top.add(mid);

    fill(0);
    text(a_dot_b.toFixed(2) + " dot(a, b)", 10, 25);

    noStroke();

    if (a_dot_b < 0) {
        fill(negative_color);
        text("negative back-facing halfspace", 10, 50);
        stroke(negative_color);
    } else {
        fill(positive_color);
        text("positive front-facing halfspace", 10, 50);
        stroke(positive_color);
    }
    
    strokeWeight(2);
    line(mid.x, mid.y, cross_top.x, cross_top.y);
    line(mid.x, mid.y, cross_bottom.x, cross_bottom.y);
}