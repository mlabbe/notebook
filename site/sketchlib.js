let draw_labels_on_sketch_vectors = false;

let VALUE_COLUMN = 140;
let LABEL_COLUMN = VALUE_COLUMN + 200;

// preload this resource for every page
let sketchFont;
function preload() {
    sketchFont = loadFont('../assets/SourceCodePro-Medium.ttf');    
}

// return the sqdist between c and segment ab
function sqDistPointSegment(a, b, c) {
    let ab = p5.Vector.sub(b, a);
    let ac = p5.Vector.sub(c, a);
    let bc = p5.Vector.sub(c, b);

    let e = p5.Vector.dot(ac, ab);

    // c projects outside ab
    if (e <= 0) return p5.Vector.dot(ac, ac);

    let f = p5.Vector.dot(ab, ab);
    if (e >= f)
        return p5.Vector.dot(bc, bc);

    // handle cases where c projects onto ab
    return p5.Vector.dot(ac, ac) - e * e / f;
}

function sketchVectorFromVec(vec, col, scale, is_pickable, label) {
    let CLICK_RADIUS_SQUARED = 10.0 * 10.0;

    this.vec = vec;
    this.col = col;
    this.scale = scale;
    this.is_pickable = is_pickable;
    this.label = label;

    this.drawCentered = function (is_selected) {
        let is_mouse_in_sketch = 
            (mouseX > 0 && mouseX <= width &&
             mouseY > 0 && mouseY <= height);
        if (is_mouse_in_sketch && this.is_pickable) {
            if (is_selected)
                strokeWeight(3);
            else
                strokeWeight(3);
            
        } else {
            strokeWeight(2);
        }

        push();
        stroke(this.col);
        
        //strokeWeight(3);
        fill(this.col);
        translate(width / 2, height / 2);
        line(0, 0, this.vec.x * this.scale, this.vec.y * this.scale);
        if (this.is_pickable) {
            rotate(this.vec.heading());
            let arrowSize = 12;
            translate((this.vec.mag() * this.scale) - arrowSize, 0);
            triangle(0, arrowSize / 2, 0, 
                -arrowSize / 2, arrowSize, 0);
        }
        pop();
        
    };
    
    this.printVec2 = function (increment) {
        strokeWeight(1);
        stroke(this.col);
        fill(this.col);

        let y = getTextY(increment);
        text("" + this.vec.x.toFixed(2) + ", " + this.vec.y.toFixed(2) + "", VALUE_COLUMN, y);

        text(this.label, LABEL_COLUMN, y);
    };

    this.clickTest = function () {
        let mid = createVector(width / 2, height / 2);
        let mouse = createVector(mouseX - mid.x, mouseY - mid.y);

        let d = sqDistPointSegment(0, p5.Vector.mult(this.vec, this.scale), mouse);

        return (d <= CLICK_RADIUS_SQUARED);
    }

    return this;
}

function printScalar(increment, col, scalar, label) {
    strokeWeight(1);
    stroke(col);
    fill(col);

    let y = getTextY(increment);
    text(scalar.toFixed(2), VALUE_COLUMN, y);

    text(label, LABEL_COLUMN, y);
}

// convention to increment text vertically
function getTextY(increment) {
    return 0 + (increment * 22);
}

function setupCommon() {
    
    textSize(18);
    return createCanvas(640, 680);
}

function pickTool() {

    this.currentSelection = null;
    this.clickables = [];

    this.mousePressed = function () {        
        this.currentSelection = null;

        for (let i = 0; i < this.clickables.length; i++) {
            let was_clicked = this.clickables[i].clickTest();

            if (was_clicked) {
                this.currentSelection = this.clickables[i];
                break;
            }
        }
    };

    this.mouseReleased = function() {
        this.currentSelection = null;
    };

    this.getCurrentSelection = function() {

        // null if no selection
        return this.currentSelection;
    };

    // call in draw to set the cursor
    this.setCursor = function () {
        if (this.currentSelection == null) {
            for (let i = 0; i < this.clickables.length; i++) {

                if (this.clickables[i].clickTest()) {
                    cursor(HAND);
                    return;
                }
            }

            cursor(ARROW);
        }
        else {
            noCursor();
        }
    };

    this.shouldPreventScrolling = function() {
        return this.currentSelection == null;
    }

    return this;
}

function centeredPVectorFromMouse() {
    let v = createVector(mouseX, mouseY);
    let mid = createVector(width / 2, height / 2);
    v.sub(mid);

    // constrain vector length to sketch window
    let c = Math.min(mid.x, mid.y);
    c *= 0.65;

    if (v.mag() > c) {
        v.normalize();
        v.mult(c);
    }

    return v;
}

function drawGrid() {
    background(250);
    strokeWeight(1);

    let drawGridStep = function (subdiv, step_start_div) {
        let x_step = width / subdiv;

        for (let x = x_step / step_start_div; x < width; x += x_step) {
            line(x, 0, x, height);
        }

        let y_step = height / subdiv;
        for (let y = y_step / step_start_div; y < height; y += y_step) {
            line(0, y, width, y);
        }
    }

    stroke(230);
    drawGridStep(20, 2.0);
}

function drawTextBackground(num_text_lines) {
    textFont(sketchFont, 15);
    stroke(192);
    strokeWeight(3);
    fill(255);
    rect(-10, -10, width+20, getTextY(num_text_lines + 2));

}

// only call from setup()
let static_color_index = 0;
function getNextColor() {
    const colors = ["#63a4c5", "#f29a00", "#64555c", "#d45025", "#df9a4b", "#00645c"];

    if (static_color_index == colors.length)
        static_color_index = 0;

    return colors[static_color_index++];
}
