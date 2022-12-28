
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

const INFLUENCE_STEP = 0.02;

function sdfPoint(startX, startY) {

    // just for ui selection
    this.selectionCenterRadius = 6;

    // the actual radius of effect
    this.sdfRadius = this.selectionCenterRadius;
    
    this.origin = createVector(startX, startY);

    this.influenceWeight = createVector(0, 1);

    this.enabled = true;

    this.draw = function(is_selected) {
        if (!this.enabled)
            return;

        //
        // draw influence vectors
        if (is_selected) {
            const INFLUENCE_SCALE = 30.0;
            strokeWeight(2);
            stroke(100, 100, 192);
            line(this.origin.x, this.origin.y,
              this.origin.x + (this.influenceWeight.x * INFLUENCE_SCALE), this.origin.y);
            line(this.origin.x, this.origin.y,
              this.origin.x, this.origin.y + (this.influenceWeight.y * INFLUENCE_SCALE));
        }

        //
        // draw outer influence circle
        stroke(192);
        fill(192, 192, 192, 32);
        //noFill();
        circle(this.origin.x, this.origin.y,
               this.sdfRadius * 2);            

        //
        // draw selection center radius
        noStroke();
        if (is_selected) {
            fill(selectedColor);
        } else {
            fill(0);
        }
        circle(this.origin.x, this.origin.y,
               this.selectionCenterRadius * 2);


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

function luaLog(pts) {    
    s = "";
    for (let i = 0; i < pts.length; i++) {
        let pt = pts[i];
        s += "-- " + i + "\n"
         + "advance_timeline(" + pt.origin.x + ")\n"
         + "height_displacement{\n" + 
         "  y = " + pt.origin.y + ",\n" +
         "  radius = " + pt.sdfRadius + ",\n" +
         "  weight = " + pt.influenceWeight.y + ",\n" +
         "}\n";
    }

    console.log(s);
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

        let influence = createVector(
            delta.x * ratio * sdf.influenceWeight.x, 
            delta.y * ratio * sdf.influenceWeight.y);
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
    if (keyCode == 76 /* l */) {
        console.log("logging");        
        luaLog(sdfPoints);
    }

    if (keyCode == 86 /* v */) {
        visSdfPoints = !visSdfPoints;
    }

    if (keyCode == 67 /* c */) {
        selectedSdfPoint.enabled = false;
        sdfPoints = [];    
    }
    
    if (selectedSdfPoint) {
        if (keyCode == DELETE || keyCode == BACKSPACE) {
            selectedSdfPoint.enabled = false;

            if (sdfPoints.length > 0) {

                // find last enabled one
                let found = false;
                for (i = sdfPoints.length - 1; i >= 0; i--) {
                    if (sdfPoints[i].enabled) {                        
                        selectedSdfPoint = sdfPoints[i];
                        found = true;
                        break;
                    }
                }
                if (!found)
                    selectedSdfPoint = null;


            } else {
                selectedSdfPoint = null;
            }
        } 
    }

}

function draw(is_selected) {
    drawGrid();

    if (selectedSdfPoint && keyIsPressed) {
        if (key == '1') {
            selectedSdfPoint.influenceWeight.y -= INFLUENCE_STEP;
        } else if (key == '2') {
            selectedSdfPoint.influenceWeight.y += INFLUENCE_STEP;
        }
    }    

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
