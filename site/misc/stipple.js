let labelColor;
let numberColor;
let lineColor;
let input_num, input_factor;

function position_element_on_canvas(e) {
    e.parent("canvas"); // requires <main> to have id #canvas
    e.style('position', "relative");
    e.style('top', '-620px');
    e.style('left', '30px');
    e.style('margin-right', '50px');
}

function setup() {
    setupCommon();



    //input_num = createInput(0x5555, 'number');
    input_num = createSlider(0, 65535, 0x5555, 1);
    input_num.style('width', '256px');
    /*
    input_num.style('font-size', '16px');
    input_num.style('background-color', "#e0e0e0");
    */
    position_element_on_canvas(input_num);

    
    input_factor = createSlider(1, 256, 4, 1);
    input_factor.style('width', '256px');
    position_element_on_canvas(input_factor);


    labelColor = getNextColor();
    numberColor = getNextColor();
    lineColor = getNextColor();
}


function num_in_string_to_base(s, base) {
    let num = Number(s);
    if (isNaN(num))
        return 0;  
        
    if (num > 0xFFFF)
        num = 0xFFFF;
        
    let num_str = num.toString(base);

    if (base == 16) {
        num_str = "0x" + num_str.toUpperCase();
    } else if (base == 2) {
        num_str = "0b" + num_str;
    }

    return num_str;
}

// pattern is between 0 and 65535
// factor is between 1 and 255
function draw_stipple_pattern(pattern, factor, y) {
    
    noSmooth();
    fill(lineColor);
    noStroke();

    let mask = 0x8000; // start with leftmost bit set    
    let shift_count = 0;
    
    for (let x = 0; x < width; x += factor) {

        const bit = (pattern & mask) !== 0 ? 1 : 0;

        mask >>= 1;
        shift_count++;
        
        if (bit) {
            rect(x, y, factor, 50);
        }

        if (shift_count == 16) {
            mask = 0x8000;
            shift_count = 0;
        }
    }
    
    
}

function draw() {
    smooth();
    drawGrid();

    //
    // 16-bit pattern
    textSize(24);
    fill(labelColor);
    text('16-Bit Pattern', 30, 50);

    fill(numberColor);
    text(num_in_string_to_base(input_num.value(), 16), 30, 110);
    text(num_in_string_to_base(input_num.value(), 2,), 30, 140);

    //
    // factor
    fill(labelColor);
    text('Factor (1-256)', 340, 50);

    //
    // draw pattern
    let num = Number(input_num.value());
    if (isNaN(num))
        return;
    num = Math.min(num, 0xFFFF);
    num = Math.max(num, 0);

    let factor = Number(input_factor.value());
    draw_stipple_pattern(num, factor, height / 2);
}