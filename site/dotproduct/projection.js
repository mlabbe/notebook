let mid = null;
let a = null;
let b = null;
let currentlyManipulatedVector = 0;
let CLICK_RADIUS = 5.0;

// extend the PVector to include colors 
// and our own draw method



function sketchVectorFromVec(vec, col, scale, is_pickable) {

    this.vec = vec;
    this.col = col;
    this.scale = scale;
    this.is_pickable = is_pickable;
    
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


        strokeWeight(1);
    };

    this.printVec2 = function(label, offset) {
        stroke(this.col);
        text(label + " [" + this.vec.x.toFixed(2) + ", " + this.vec.y.toFixed(2) + "]", 10, 10 + (offset * 15));
    };

    this.clickTest = function() {
        let mouse = createVector(mouseX, mouseY);
        
        // take into account the visual scale of this vector for the click test
        let w = p5.Vector.mult(this.vec, this.scale);

        let worldVec = createVector(w.x + mid.x, w.y + mid.y);

        let d = p5.Vector.sub(mouse, worldVec).mag();
        //console.log(d <= CLICK_RADIUS);
        return d <= CLICK_RADIUS;
    }

    return this;
}



function setup() {
    createCanvas(640, 480);
    cursor(CROSS);

    mid = createVector(width/2, height/2);
    a = new sketchVectorFromVec(createVector(1, 0), "red", 25.0, true);
    //b = new sketchVectorFromVec(createVector(10.0, 10.0), "blue");        
    b = new sketchVectorFromVec(createVector(0, 30), "blue", 1.0, true);

}

function mouseClicked() {

    let a_clicked = a.clickTest();
    let b_clicked = b.clickTest();

    if (!a_clicked && !b_clicked) {
        currentlyManipulatedVector = 0;
        return;
    }

    if (b_clicked){
        if (currentlyManipulatedVector == 2)
            currentlyManipulatedVector = 0;
        else
            currentlyManipulatedVector = 2;
        return;
    } 

    if (a_clicked) {
        if (currentlyManipulatedVector == 1)
            currentlyManipulatedVector = 0;
        else
        currentlyManipulatedVector = 1;
        return;
    }
}

function draw() {
    clear();

    if (currentlyManipulatedVector == 1) {
        a.vec.x = mouseX - mid.x;
        a.vec.y = mouseY - mid.y;
        noCursor();
    } else if (currentlyManipulatedVector == 2) {
        b.vec.x = mouseX - mid.x;
        b.vec.y = mouseY - mid.y;
        noCursor();
    } else {
        cursor(CROSS);
    }

    //
    // actual math here
    //
    a.vec.normalize();
    let signed_length = p5.Vector.dot(a.vec, b.vec);

    // fixme: the fucking math is wrong
    let a_dot_b = new sketchVectorFromVec(p5.Vector.mult(a.vec, b.vec), "green", 1.0, false);
    

    //
    // graph 'em
    //
    a.printVec2("a (norm)", 1);
    a.drawCentered(currentlyManipulatedVector == 1);

    b.printVec2("b", 2);
    b.drawCentered(currentlyManipulatedVector == 2);

    a_dot_b.printVec2("a_dot_b", 3);
    a_dot_b.drawCentered(false);


    // annotate 'em
    //    noStroke();
    //text('norm a ' + a.x + , 10, 10);


}
