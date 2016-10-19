//an action is some movement the player must perform

//okay I need to know 4 things:
// 1 - what action the player must perform
// 2 - what position must the action be drawn at the time the player should perform it
// 3 - what time the action needs to be at that position
// 4 - what speed the action should approach the goal at so I know when to start drawing it
function makeAction(ctx,
                    action, //some way of describing the action
                    actionTime, //some time in ms
                    actionPos, //a value s.t. -1 and 1 will draw the center of the shape on each edge of the screen
                    actionSpeed, //how many much of the 2 units of screen space to move per ms
                    options)
{
    var _ctx = ctx;
    var y = options.ypos === undefined? 60 : options.ypos;
    var height = options.height === undefined? 100 : options.height;
    //ranges from -1 to 1 lol why did I do this xD

    function draw(time) {
        var x = getPos(time);

        if (!(Math.abs(x) > 1.2)) //ok this might not be offscreen (I guess I should actually work it out lol)
        {
            drawChevron(_ctx, (x / 2  + 0.5) * window.innerWidth, y, height, 20, action.color, action.left);
            return true;
        }
        return false;
    }

    function getPos(time) {
        return actionPos + (time - actionTime) * actionSpeed;
    }

    return { draw : draw };
}


function drawChevron(ctx, x, y, height, thickness, color, pointLeft) {
    //default args for some reason
    ctx.fillStyle = color || "green";
    pointLeft = pointLeft === undefined ? true : pointLeft;
    x = x || 0;
    y = y || 0;
    thickness = thickness || 20; //not really thickness, if this number is x, that's sqrt(2*x^2)
    height = height || 60;  
    
    var halfheight = height / 2;
    var width = height / 2 + thickness;
    var mirror = pointLeft ? 1 : -1;
    var mirrorOffset = pointLeft ? 0 : width;
    
    // Filled chevron
    ctx.beginPath();
    ctx.moveTo(x + mirrorify(width - thickness), y);
    ctx.lineTo(x + mirrorify(0), y + halfheight);
    ctx.lineTo(x + mirrorify(width - thickness), y + height);
    ctx.lineTo(x + mirrorify(width), y + height - thickness);
    ctx.lineTo(x + mirrorify(2 * thickness), y + halfheight);
    ctx.lineTo(x + mirrorify(width), y + thickness);
    ctx.fill();

    function mirrorify(a) {
        return a * mirror + mirrorOffset;
    }
}

module.exports = makeAction;
