let INTERVAL_HEIGHT_OFFSET = 140;

let pick_tool = null;

let intervals_a = null;
let intervals_b = null;


function setup() {
    setupCommon();

    /*
    intervals_a = [
        inputInterval(10, 200, true),
        inputInterval(320, 400, true),        
        //inputInterval(450, 500, true),

        inputInterval(500, 600, true),
        inputInterval(620, 630, true)                    
        
    ];
    intervals_b = [
        inputInterval(40, 200, false),
        inputInterval(280, 450, false),

        //inputInterval(500, 600, false),
        //inputInterval(620, 630, false)                    

    ];
    */
    intervals_a = [
        inputInterval(10, 200, true),
        inputInterval(300, 350, true),
    ];

    intervals_b = [
        inputInterval(10, 150, false),
        inputInterval(170, 250, false),

        inputInterval(400, 450, false),        
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

// check if pt is in a set of intervals, excluding a single interval from the check
function pt_in_interval_set(pt, interval_set, exclude_interval) {
    for (let i = 0; i < interval_set.length; i++) {
        if (interval_set[i] == exclude_interval)
            continue;

        if (pt >= interval_set[i].i0 && pt <= interval_set[i].i1)
            return true;
    }
    return false;
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

    this.move = function(belong_set) {

        // ensure new point is not in existing interval

        // todo: constrain pt more than mouseX  or it snaps to previous interval
        if (pt_in_interval_set(mouseX, belong_set, this)) {
            return;
        }

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

        rect(this.i0, mid - half_height, this.i1 - this.i0, half_height * 2);
    }

    this.dump = function() {
        console.log("[" + this.i0 + ", " + this.i1 + "]");
    }
}

// one of the purple lines
function inputInterval(i0, i1, upper) {
    let y = height / 2;

    y -= upper ? INTERVAL_HEIGHT_OFFSET : -INTERVAL_HEIGHT_OFFSET;

    let inter = new interval(i0, i1, y, "#AE5CD8", true);
    inter.upper = upper;

    return inter;
}

// a comparative interval, visualized as a box
function ctorDiffInterval(i0, i1, is_a_overlap_b) {

    let col = is_a_overlap_b ? "#C30F0F" : "#0FC335";

    return new interval(i0, i1, 0, col, false);
}

function compareIntervals(int_a, int_b) {
    
    let diff_set = [];

    let length = Math.min(int_a.length, int_b.length);

    for (let i = 0; i < length; i++) {

        // a start is less than b start
        if (int_a[i].i0 < int_b[i].i0) {
            diff_set.push(ctorDiffInterval(int_a[i].i0, int_b[i].i0, true));
        }

        // b start is less than a start
        if (int_a[i].i0 > int_b[i].i0) {
               diff_set.push(ctorDiffInterval(
                int_b[i].i0, 
                int_a[i].i0, 
                false));
        }

        // a end is less than b end
        if (int_a[i].i1 < int_b[i].i1) {
            diff_set.push(ctorDiffInterval(int_a[i].i1, int_b[i].i1, false));
        }

        // b end is less than b start
        if (int_a[i].i1 > int_b[i].i1) {
            diff_set.push(ctorDiffInterval(int_b[i].i1, int_a[i].i1, true));
        }    
    }

    // go through and clip each one
    for (let i = 1; i < diff_set.length; i++) {
        let j = i - 1;
        if (diff_set[i].i0 < diff_set[j].i1) {
            diff_set[i].i0 = diff_set[j].i1;
        }
    }

    //console.log("dump");
    //dumpIntervalSet(diff_set);

    // if one interval set is larger than the other, all remaining intervals
    // are added as differences
    /*
    if (int_b.length > int_a.length) {
        for (let i = int_a.length; i < int_b.length; i++) {
            diff_set.push(ctorDiffInterval(int_b[i].i0, int_b[i].i1, false));
        }
    } else if (int_a.length > int_b.length) {
        for (let i = int_b.length; i < int_a.length; i++) {
            diff_set.push(ctorDiffInterval(int_a[i].i0, int_a[i].i1, true));
        }
    }
*/
    return diff_set;
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

function dumpIntervalSet(iset) {
    for (let i = 0; i < iset.length; i++) {
        iset[i].dump();
    }
}

function keyReleased() {
    if (keyCode == 76 /* l */) {
        console.log("a");
        dumpIntervalSet(intervals_a);
        console.log("b");
        dumpIntervalSet(intervals_b);   
    }
}

function draw() {
    drawGrid();


    let selected_interval = pick_tool.getCurrentSelection();
    if (selected_interval != null) {
        let belong_set = selected_interval.upper ? intervals_a : intervals_b;

        selected_interval.move(belong_set);
        // todo: enforce no overlap
    }

    // todo: sort intervals by starting point in case they get out of sorts

    pick_tool.setCursor();    
    //
    // actual math here
    //

    let diff = compareIntervals(intervals_a, intervals_b);
    //console.log("dump");
    //dumpIntervalSet(diff);

    //let a_no_overlap_b = [
    //    diff_interval(10, 30, true),
    //];

    //
    // draw intervals
    //

    drawMidpoint();
    drawIntervalSet(intervals_a);
    drawIntervalSet(intervals_b);

    for (let i = 0; i < diff.length; i++) {
        diff[i].drawAsBox();

    }

    //a_no_overlap_b[0].drawAsBox();
}