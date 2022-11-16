let draw_labels_on_sketch_vectors = false;

function sketchVectorFromVec(vec, col, scale, is_pickable, label) {
    let CLICK_RADIUS = 7.0;

    this.vec = vec;
    this.col = col;
    this.scale = scale;
    this.is_pickable = is_pickable;
    this.label = label;
    
    this.drawCentered = function(is_selected) {
        if (is_selected)
            strokeWeight(3);
        else
            strokeWeight(1);

        stroke(this.col);
        
        let w = p5.Vector.mult(this.vec, this.scale);

        let mid = createVector(width/2, height/2);
        line(mid.x, mid.y,
             mid.x + w.x, mid.y + w.y);

        if (this.is_pickable) {
            if (is_selected) 
                fill(this.col);
            else
                noFill();

            circle(mid.x + w.x, mid.y + w.y, CLICK_RADIUS);
        }

        if (draw_labels_on_sketch_vectors) {
            noStroke();
            fill(this.col);
            text(this.label, mid.x + w.x + 10, mid.y + w.y);
        }

        strokeWeight(1);
    };

    this.printVec2 = function(increment) {
        noStroke();
        fill(this.col);

        let y = getTextY(increment);
        text("" + this.vec.x.toFixed(2) + ", " + this.vec.y.toFixed(2) + "", 10, y);

        stroke(this.col);        
        text(this.label, 150, y);
    };

    this.clickTest = function() {
        let mouse = createVector(mouseX, mouseY);
        
        // take into account the visual scale of this vector for the click test
        let w = p5.Vector.mult(this.vec, this.scale);
        let mid = createVector(width/2, height/2);

        let worldVec = createVector(w.x + mid.x, w.y + mid.y);

        let d = p5.Vector.sub(mouse, worldVec).mag();
        //console.log(d <= CLICK_RADIUS);

        return d <= CLICK_RADIUS;
    }

    return this;
}

// convention to increment text vertically
function getTextY(increment) {
    return 10 + (increment * 25);
}

function setupCommon() {
    createCanvas(640, 480);
    textSize(18);
}

function pickTool() {

    this.currentSelection = null;
    this.clickables = [];

    // call in mouseClicked function
    this.mouseClicked = function() {

        let clicked = [];
        let has_any_been_clicked = false;

        let last_selection = this.currentSelection;
        this.currentSelection = null;

        for (let i = 0; i < this.clickables.length; i++) {
            let was_clicked = this.clickables[i].clickTest();
            
            if (was_clicked) {
                // selecting the current selection is just clicking to de-select
                if (last_selection !== this.clickables[i])
                    this.currentSelection = this.clickables[i];
                break;
            }            
        }

        //console.log(this.currentSelection);
    };

    this.getCurrentSelection = function() {

        // null if no selection
        return this.currentSelection;
    }

    // call in draw to set the cursor
    this.setCursor = function() {
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

    return this;
}

function centeredPVectorFromMouse() {
    let v = createVector(mouseX, mouseY);
    let mid = createVector(width/2, height/2);    
    v.sub(mid);

    // constrain vector length to sketch window
    let c = Math.min(mid.x, mid.y);
    c *= 0.95;

    if (v.mag() > c) { 
        v.normalize();
        v.mult(c);
    }

    return v;
}

function drawGrid() {
    background(250);

    let drawGridStep = function(subdiv, step_start_div) {
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
    drawGridStep(10, 1.0);
}

// only call from setup()
let static_color_index = 0;
function getNextColor() {
    const colors = ["#63a4c5", "#f29a00", "#64555c", "#f0cf6e", "#df9a4b", "#00645c", ];

    if (static_color_index == colors.length)
        static_color_index = 0;

    return colors[static_color_index++];
}
