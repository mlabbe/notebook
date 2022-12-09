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


function mousePressed() {
    pick_tool.mousePressed();
}

function mouseReleased() {
    pick_tool.mouseReleased();
}

function touchMoved() {
    return pick_tool.shouldPreventScrolling();
}

function set_color_for_sign(d) {
    if (d < 0) {
        fill(negative_color);
        stroke(negative_color);
    } else {
        fill(positive_color);
        stroke(positive_color);    
    }
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


    //
    // graph 'em 'em
    //
    a.drawCentered(pick_tool.getCurrentSelection() === a);
    b.drawCentered(pick_tool.getCurrentSelection() === b);    


    // draw halfspace boundary
    let cross_top = createVector(a.vec.y, -a.vec.x);
    cross_top.mult(1000);
    let cross_bottom = createVector(-cross_top.x, -cross_top.y);
    cross_bottom.add(mid);

    cross_top.add(mid);
    strokeWeight(2);
    set_color_for_sign(a_dot_b);
    line(mid.x, mid.y, cross_top.x, cross_top.y);
    line(mid.x, mid.y, cross_bottom.x, cross_bottom.y);

    drawTextBackground(2);
    printScalar(1, 0, a_dot_b, "dot(a, b)");
    set_color_for_sign(a_dot_b);
    if (a_dot_b < 0) {
        text("negative back-facing halfspace", VALUE_COLUMN, 50);
    } else {
        text("positive front-facing halfspace", VALUE_COLUMN, 50);
    }
    
}