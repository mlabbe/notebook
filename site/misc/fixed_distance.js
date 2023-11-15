let pick_tool = null;
let a = null;
let b = null;
let diff_color = null;

// Number of bits of the bigint to treat as the fractional part
// Because the magnitude of the vectors in the test are 0-100
// no scaling is needed. 
//
// However, if the scale of the vector is 0-1, then this upscale
// is necessary in order to have enough bits to offer precision.
const FIXED_FRACBITS = 15;

function setup() {
    setupCommon();

    a = new sketchVectorFromVec(createVector(100, -100),
        getNextColor(), 1.0, true, "a");
    a.label = "sqrt dist";
    a.draw_arrowhead = false;

    b = new sketchVectorFromVec(createVector(100, -100),
        getNextColor(), 1.0, true, "b");
    b.label = "approx dist";
    
    pick_tool = new pickTool();
    pick_tool.clickables = [a];

    diff_color = getNextColor();
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

function fx_from_number(n) {    
    return BigInt(Math.trunc(n * (1 << FIXED_FRACBITS)));
}

function fx_to_number(fx) {
    return Number(fx) / Number(1 << FIXED_FRACBITS);
}

function bigint_vec(v) {
    return {x: fx_from_number(v.x), y: fx_from_number(v.y)};
}

function bigint_abs(n) {
    return n < 0n ? -n : n;
}

function fx_approx_dist(v) {
    let dx = bigint_abs(v.x);
    let dy = bigint_abs(v.y);

    if (dx < dy) {
        return dx + dy - (dx >> 1n);
    } else {
        return dx + dy - (dy >> 1n);
    }    
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
    let approx_length = fx_approx_dist(bigint_vec(a.vec));
    let sqrt_length   = Math.sqrt(p5.Vector.dot(a.vec, a.vec));
    let delta = fx_to_number(approx_length) - sqrt_length;

    //
    // graph 'em
    //

    // approx length vector is a, but scaled to approx_length
    b.vec = a.vec.copy();
    b.vec.normalize();
    b.vec.mult(fx_to_number(approx_length));

    b.drawCentered(false);
    a.drawCentered(pick_tool.getCurrentSelection() == a);


    drawTextBackground(2);
    printScalar(1, a.col, sqrt_length, "sqrt length");
    printScalar(2, b.col, fx_to_number(approx_length), "approx length");
    printScalar(3, diff_color, delta, "error delta");   
}