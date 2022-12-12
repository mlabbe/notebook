
// in pixels, vs width
let POINT_LENGTH = 10;
let num_points =  0;

let points = [];
let sdfPoints = [];

let selectedColor = null;

let visSdfPoints = true;

const SelectionModes = {
    None: "None",
    CreateNewPoint: "CreateNewPoint",
    IdleSelected: "IdleSelected",
    MoveExistingPoint: "MoveExistingPoint",
};

let selectionMode = SelectionModes.None;

let selectedSdfPoint = null;

function sdfPoint(startX, startY) {

    // just for ui selection
    this.selectionCenterRadius = 4;

    // the actual radius of effect
    this.sdfRadius = this.selectionCenterRadius;
    
    this.origin = createVector(startX, startY);

    this.enabled = true;

    this.draw = function(is_selected) {
        if (!this.enabled)
            return;

        noStroke();
        if (is_selected) {
            fill(selectedColor);
        } else {
            fill(0);
        }
        circle(this.origin.x, this.origin.y,
               this.selectionCenterRadius * 2);

        stroke(192);
        fill(192, 192, 192, 32);
        //noFill();
        circle(this.origin.x, this.origin.y,
               this.sdfRadius * 2);
    }

    this.setRadiusFromPoint = function(x, y) {
        let pt = createVector(x, y);
        let d = p5.Vector.sub(this.origin, pt);
        this.sdfRadius = d.mag();
    }
    
    return this;
}

function clickTestSdfPoints() {
    let mouse = vecFromMouse();

    for (let i = 0; i < sdfPoints.length; i++) {
        if (!sdfPoints[i].enabled) 
            continue;
         
        let d = p5.Vector.sub(sdfPoints[i].origin, mouse);
        if (d.mag() < sdfPoints[i].selectionCenterRadius * 2) {
            return sdfPoints[i];
        }
    }

    return null;
}

function setup() {
    setupCommon();

    num_points = width / POINT_LENGTH;

    selectedColor = getNextColor();
}

function drawPointsAsLine(pts) {
    strokeWeight(3);

    let midpoint = pts.length / 2;

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

function influencePointBySdfPoints(pt) {
    
    for (i = 0; i < sdfPoints.length; i++) {
        if (!sdfPoints[i].enabled)
            continue;
        let sdf = sdfPoints[i];

        let delta = p5.Vector.sub(sdf.origin, pt);
        
        // positive diff means sdfRadius overlaps pt
        let diff = sdf.sdfRadius - delta.mag();
        if (diff < 0)
            stroke(255,0,0);
        else
            stroke(192);

        // influence in normalized range 0-1
        let ratio = diff / sdf.sdfRadius;

        /*
        line(sdf.origin.x, sdf.origin.y,
             pt.x, pt.y);
            */

        if (diff < 0)
            continue;

        let influence = createVector(delta.x * ratio, delta.y * ratio);
        pt = p5.Vector.sub(pt, influence);
    }

    return pt;
}

function mouseMoved() {
    let sdfPointClickedOn = clickTestSdfPoints();
    if (sdfPointClickedOn != null) {
        cursor(CROSS);
    } else {
        cursor(ARROW);
    }
}

function mousePressed() {
    let sdfPointClickedOn = clickTestSdfPoints();
    let clickedOnExisting = sdfPointClickedOn != null;

    if (selectionMode == SelectionModes.IdleSelected && !clickedOnExisting) {
        selectedSdfPoint = null;
        selectionMode = SelectionModes.None;
    }

    if (selectionMode == SelectionModes.None && !clickedOnExisting) {
        selectionMode = SelectionModes.CreateNewPoint;
        selectedSdfPoint = new sdfPoint(mouseX, mouseY);
        sdfPoints.push(selectedSdfPoint);

    } else if (clickedOnExisting) {
        selectedSdfPoint = sdfPointClickedOn;
        selectionMode = SelectionModes.IdleSelected;
    }
}

function mouseDragged() {
    if (selectionMode == SelectionModes.CreateNewPoint) {
        selectedSdfPoint.setRadiusFromPoint(mouseX, mouseY);

    } if (selectionMode == SelectionModes.IdleSelected) {
        selectionMode = SelectionModes.MoveExistingPoint;
    }

    if (selectionMode == SelectionModes.MoveExistingPoint) {
        selectedSdfPoint.origin = vecFromMouse();
    }

}

function mouseReleased() {

    if (selectionMode == SelectionModes.CreateNewPoint) {
        selectionMode = SelectionModes.IdleSelected;

    } else if (selectionMode == SelectionModes.IdleSelected) {
        selectedSdfPoint = clickTestSdfPoints();
        selectionMode = SelectionModes.IdleSelected;
    } else if (selectionMode == SelectionModes.MoveExistingPoint) {
        //selectedSdfPoint = null;
        selectionMode = SelectionModes.IdleSelected;
    }
}

function keyReleased() {
    if (keyCode == DELETE) {
        if (selectedSdfPoint !== null) {
            selectedSdfPoint.enabled = false;
            selectedSdfPoint = null;
        }
    } else if (keyCode == 86 /* v */) {
        visSdfPoints = !visSdfPoints;
    }

    


}

function draw(is_selected) {
    drawGrid();

    if (visSdfPoints) {
        for (let i = 0; i < sdfPoints.length; i++) {
            sdfPoints[i].draw(selectedSdfPoint === sdfPoints[i]);
        }
    }

    // reset the points for this frame
    {
        points = [];
        let y = height / 2;

        for (let i = 0; i < num_points; i++) {
            points.push(createVector(i * POINT_LENGTH, y));
        }
    }
    
    for (let i = 0; i < points.length; i++) {
        points[i] = influencePointBySdfPoints(points[i]);    
    }
    
    drawPointsAsLine(points);
    
}
