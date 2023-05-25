let INTERVAL_HEIGHT_OFFSET = 60;

let pick_tool = null;

let intervals_a = null;
let intervals_b = null;


function setup() {
    setupCommon();

    intervals_a = [
        input_interval(10, 200, true),
        input_interval(320, 550, true),
    ];
    intervals_b = [
        input_interval(40, 200, false),
        input_interval(280, 450, false),
        input_interval(500, 600, false)    
    ];

    pick_tool = new pickTool();
    for (let i = 0; i < intervals_a.length; i++) {
        pick_tool.clickables.push(intervals_a[i]);
    }
    for (let i = 0; i < intervals_b.length; i++) {
        pick_tool.clickables.push(intervals_b[i]);
    }

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


// interval type
function interval(i0, i1, y, col, is_pickable) {
    this.i0 = i0;
    this.i1 = i1;

    this.y = y;
    this.selectedFeature = -1;

    if (i0 > i1) {
        console.error("interval with negative/invalid period");
    }

    this.col = col;
    this.is_pickable = is_pickable;

    this.draw = function(is_selected) {

        let is_mouse_in_sketch = 
            (mouseX > 0 && mouseX <= width &&
             mouseY > 0 && mouseY <= height);
        if (is_mouse_in_sketch && this.is_pickable) {
            if (is_selected)
                strokeWeight(3);
            else
                strokeWeight(2);
        } else {
            strokeWeight(2);
        }

        stroke(this.col);
        line(this.i0, this.y, this.i1, this.y);
    }

    this.clickTest = function () {
        let DIST = 10;


        let ivec0 = createVector(this.i0, this.y);
        let ivec1 = createVector(this.i1, this.y);
        let mouse = createVector(mouseX, mouseY);

        let sqdist = sqDistPointSegment(ivec0, ivec1, mouse);
        
        return sqdist < DIST * DIST;
    }

    this.onSelectedCallback = function() {
        // determine feature selection
        let d0 = Math.abs(this.i0 - mouseX);
        let d1 = Math.abs(this.i1 - mouseX);

        if (d0 < d1)
            this.selectedFeature = 0;
        else
            this.selectedFeature = 1;
    }

    this.move = function() {
        if (this.selectedFeature == 0) {
            this.i0 = mouseX;
        } else if (this.selectedFeature == 1) {
            this.i1 = mouseX;
        }
        
        // i0 must always be <= i1
        if (this.i0 > this.i1) {
            let tmp = this.i1;
            this.i1 = this.i0;
            this.i0 = tmp;
        }
    }

    this.drawAsBox = function() {
        strokeWeight(1);
        stroke(this.col);
        fill(this.col + "20");

        let mid = height / 2;
        let half_height = INTERVAL_HEIGHT_OFFSET - 4; // so it doesn't quite overlap 

        rect(this.i0, mid - half_height, this.i1, half_height * 2);
    }

    this.dump = function() {
        console.log("[" + this.i0 + ", " + this.i1 + "]");
    }
}

// one of the purple lines
function input_interval(i0, i1, upper) {
    let y = height / 2;

    y -= upper ? INTERVAL_HEIGHT_OFFSET : -INTERVAL_HEIGHT_OFFSET;

    return new interval(i0, i1, y, "#AE5CD8", true);
}

// a comparative interval, visualized as a box
function diff_interval(i0, i1, is_a_overlap_b) {

    let col = is_a_overlap_b ? "#C30F0F" : "#0FC335";

    return new interval(i0, i1, 0, col, false);
}

function drawMidpoint() {
    let y = height / 2;
    
    strokeWeight(3);
    stroke(0);
    line(0, y, width, y);       
}

function drawIntervalSet(intervalSet) {
    for (let i = 0; i < intervalSet.length; i++) {
        intervalSet[i].draw(pick_tool.getCurrentSelection() == intervalSet[i]);
    }
}

function dump_interval_set(iset) {
    for (let i = 0; i < iset.length; i++) {
        iset[i].dump();
    }
}

function keyReleased() {
    if (keyCode == 76 /* l */) {
        dump_interval_set(intervals_a);
    }
}

function draw() {
    drawGrid();


    let selected_interval = pick_tool.getCurrentSelection();
    if (selected_interval != null) {
        selected_interval.move();
        // todo: enforce no overlap
    }

    // todo: sort intervals by starting point in case they get out of sorts

    pick_tool.setCursor();    
    //
    // actual math here
    //
    let a_no_overlap_b = [
        diff_interval(10, 30, true),
    ];

    //
    // draw intervals
    //

    drawMidpoint();
    drawIntervalSet(intervals_a);
    drawIntervalSet(intervals_b);

    a_no_overlap_b[0].drawAsBox();
}