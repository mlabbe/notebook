
// in pixels, vs width
let POINT_LENGTH = 10;
let num_points =  0;

let points = [];
let sdfPoints = [];

const SelectionModes = {
    None: "None",
    CreateNewPoint: "CreateNewPoint",
};

let selectionMode = SelectionModes.None;

let selectedSdfPoint = null;

function sdfPoint(startX, startY) {

    // just for ui selection
    this.selectionCenterRadius = 4;

    // the actual radius of effect
    this.sdfRadius = this.selectionCenterRadius * 2;
    
    this.origin = createVector(startX, startY);

    this.draw = function() {
        noStroke();
        fill(0);
        circle(this.origin.x, this.origin.y,
               this.selectionCenterRadius);

        stroke(192);
        noFill();
        circle(this.origin.x, this.origin.y,
               this.sdfRadius);
    }

    this.setRadiusFromPoint = function(x, y) {
        let pt = createVector(x, y);
        let d = p5.Vector.sub(this.origin, pt);
        this.sdfRadius = d.mag() * 2;
    }
    
    return this;
}


function setup() {
    setupCommon();
    
    num_points = width / POINT_LENGTH;

}

function drawPointsAsLine(pts) {
    // start at 1 so it's not off-screen
    for (let i = 1; i < pts.length - 1; i++) {
        if (i % 2)
            stroke(0);
        else
            stroke(255, 0, 0);
        line(pts[i].x, pts[i].y,
             pts[i+1].x, pts[i+1].y);
    }
}

function influencePointBySdfPoint(pt, sdf) {
    // todo: this
}

function mousePressed() {
    // case: drag to create new sdfPoint
    let clickedOnExisting = false;
    
    if (selectionMode == SelectionModes.None &&
        !clickedOnExisting) {
        selectionMode = SelectionModes.CreateNewPoint;
        selectedSdfPoint = new sdfPoint(mouseX, mouseY);
        sdfPoints.push(selectedSdfPoint);
    }
        
}

function mouseDragged() {
    if (selectionMode == SelectionModes.CreateNewPoint) {
        selectedSdfPoint.setRadiusFromPoint(mouseX, mouseY);
    }
}

function mouseReleased() {
    if (selectionMode == SelectionModes.CreateNewPoint) {
        selectionMode = SelectionModes.None;
        selectedSdfPoint = null;
    }
}


function draw() {
    drawGrid();

    for (let i = 0; i < sdfPoints.length; i++) {
        sdfPoints[i].draw();
    }

    // reset the points for this frame
    {
        points = [];
        let y = height / 2;

        for (let i = 0; i < num_points; i++) {
            points.push(createVector(i * POINT_LENGTH, y));
        }
    }
    
    if (sdfPoints.length > 0)
        influencePointBySdfPoint(points[5], sdfPoints[sdfPoints.length-1]);

    drawPointsAsLine(points);
    
}
