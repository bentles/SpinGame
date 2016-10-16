var THREE = require('./lib/three.js');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 1000;
var touches = require('./touches.js')(camera, scene);
  
var audioListener = new THREE.AudioListener();
camera.add( audioListener );

var clickBuffer;
var metronomeBuffer;
var ready1 = false;
var ready2 = false;
var loader = new THREE.AudioLoader();
loader.load('click.ogg',    
	function ( audioBuffer ) { //loaded
        clickBuffer = audioBuffer;
        ready1 = true;
	}, function ( xhr ) {}, function ( xhr ) {console.log( 'An error happened' );}
);
loader.load('metronome.ogg',
    function (audioBuffer) {
        metronomeBuffer = audioBuffer;
        ready2 = true;
    }, function(){}, function(){console.log('An error happened that was a more different error');});

var bpm = 120;
var mspb = (60 * 1000)/ bpm;

var yOffset = -100;
var sides = 8;
var width = 350;
var height = 200;
var gap = 20;

var mat11 = new THREE.MeshPhongMaterial( { color: 0xee1111 , shading: THREE.FlatShading, shininess: 0});
var mat12 = new THREE.MeshPhongMaterial( { color: 0x333333, shading: THREE.FlatShading, shininess: 0});
var mat1 = new THREE.MultiMaterial([mat11, mat12]);

var mat21 = new THREE.MeshPhongMaterial( { color: 0x11ee11, shading: THREE.FlatShading, shininess: 0});
var mat22 = new THREE.MeshPhongMaterial( { color: 0x333333, shading: THREE.FlatShading, shininess: 0});
var mat2 = new THREE.MultiMaterial([mat21, mat22]);

var mat31 = new THREE.MeshPhongMaterial( { color: 0x1111ee, shading: THREE.FlatShading, shininess: 0});
var mat32 = new THREE.MeshPhongMaterial( { color: 0x333333, shading: THREE.FlatShading, shininess: 0});
var mat3 = new THREE.MultiMaterial([mat31, mat32]);

var geom1 = new THREE.CylinderGeometry(width, width, height, sides);
var geom2 = new THREE.CylinderGeometry(width, width, height, sides);
var geom3 = new THREE.CylinderGeometry(width, width, height, sides);

var mesh1 = new THREE.Mesh( geom1, mat1 );
mesh1.position.y += height + gap + yOffset;
var mesh2 = new THREE.Mesh( geom2, mat2 );
mesh2.position.y += yOffset;
var mesh3 = new THREE.Mesh( geom3, mat3 );
mesh3.position.y -= height + gap - yOffset;

for(var i = 0; i <  mesh1.geometry.faces.length; i++) {
    mesh1.geometry.faces[i].materialIndex = 0;
    mesh2.geometry.faces[i].materialIndex = 0;
    mesh3.geometry.faces[i].materialIndex = 0;
}

//use the identifier on the mesh to get from the object to their velocities
var velocities = {};
velocities[mesh1.uuid] = 0;
velocities[mesh2.uuid] = 0;
velocities[mesh3.uuid] = 0;
var fingerDownFactor = {};

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set( 1, 0, 5 );

var prevPosisions = [];

var current_shape = undefined;

scene.add( mesh1 );
scene.add( mesh2 );
scene.add( mesh3 );
scene.add( directionalLight );

var renderer = new THREE.WebGLRenderer({antialias : true});
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

renderer.render( scene, camera );

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);
document.addEventListener('touchcancel', handleTouchEnd, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(e) {
    //console.log(e);
    for(var i = 0; i < e.changedTouches.length; i++) {
        touches.set(e.changedTouches[i].identifier, e.changedTouches[i]);
    }
}

function handleTouchMove(e) {
    for(var i = 0; i < e.changedTouches.length; i++) {
        var ident = e.changedTouches[i].identifier;
        var prevX = touches.get(ident).x;
        var prevObject = touches.get(ident).object;
        touches.set(ident, e.changedTouches[i]);

        var currentTouch = touches.get(ident);
        var dX = currentTouch.x - prevX;

        //touching an object affects its velocity - hilariously more fingers = faster spinning now xD
        if (currentTouch.object) 
            velocities[currentTouch.object.uuid] += dX * 3;
    }
}

function handleTouchEnd(e) {
    //console.log('nuke!');
    //until I know what I want to do with multiple touches let's pretend others don't exist :)
    for(var i = 0; i < e.changedTouches.length; i++) {
        var obj = touches.get(e.changedTouches[i].identifier).object;
        
        touches.nuke(e.changedTouches[i].identifier);
    }
}

function playClickSound(oldpos, newpos) {
    var clickThreshold = (Math.PI*(2/sides)); //how wide an arc we need to cover between clicks
    if(Math.floor(oldpos/clickThreshold) !== Math.floor(newpos /clickThreshold))
    {
        //since these things like to get stuck with isPlaying true
        //let's just make a new one and throw is away each time :)
        //how about that obama??
        var audio = new THREE.Audio( audioListener );
        audio.setBuffer(clickBuffer);
        audio.setVolume(0.2);
        audio.setPlaybackRate(2);
        audio.play();
    }    
}

function drawArrow(ctx, x, y, height, width, color) {
    ctx.fillStyle = color || "green";

    x = x || 0;
    y = y || 0;
    height = height || 60;
    width = width || 35;
    var halfheight = height / 2;
    var thickness = 10; //not really thickness, if this number is x, that's sqrt(2*x^2)
    
    // Filled triangle
    ctx.beginPath();
    ctx.moveTo(x + width - thickness, y);
    ctx.lineTo(x, y + halfheight);
    ctx.lineTo(x + width - thickness, y + height);
    ctx.lineTo(x + width, y + height - thickness);
    ctx.lineTo(x + 2*thickness, y + halfheight);
    ctx.lineTo(x + width, y + thickness);
    ctx.fill();    
}

var oldtime = 0;
var accumulator = 0;
(function animate(time) {
    var canvas = document.getElementById("overlay");
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth;
    var ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.arc(window.innerWidth / 2, 110, 60, 0, 2 * Math.PI, false);    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();

    drawArrow(ctx, (time / 4)  % window.innerWidth, 60, 100, 60, "green");
    drawArrow(ctx, ((time / 4) + 25)  % window.innerWidth , 60, 100, 60, "green");

    drawArrow(ctx, ((time / 4) + (window.innerWidth / 3))  % window.innerWidth, 60, 100, 60, "red");
    drawArrow(ctx, ((time / 4) + (window.innerWidth / 3) + 25)  % window.innerWidth , 60, 100, 60, "red");

    drawArrow(ctx, ((time / 4) + (window.innerWidth / 3) * 2)  % window.innerWidth, 60, 100, 60, "blue");
    drawArrow(ctx, ((time / 4) + (window.innerWidth / 3) * 2 + 25)  % window.innerWidth , 60, 100, 60, "blue");  
    
    requestAnimationFrame( animate );

    if (ready1 && ready2) {
    var dt = time - oldtime;
    accumulator += dt;
    if (accumulator > mspb) {
        accumulator -= mspb;
        
        var audio = new THREE.Audio( audioListener );
        audio.setBuffer(metronomeBuffer);
        audio.setVolume(0.1);
        audio.setPlaybackRate(2);
     //   audio.play();
    //    console.log("beep");
    }
    
    oldtime = time;
    
        fingerDownFactor[mesh1.uuid] = 0;
        fingerDownFactor[mesh2.uuid] = 0;
        fingerDownFactor[mesh3.uuid] = 0;

        var oldpos1 = mesh1.rotation.y;
        var oldpos2 = mesh2.rotation.y;
        var oldpos3 = mesh3.rotation.y;    

        mesh1.rotation.y += (velocities[mesh1.uuid] / window.innerWidth) * 0.6; 
        mesh2.rotation.y += (velocities[mesh2.uuid] / window.innerWidth) * 0.6; 
        mesh3.rotation.y += (velocities[mesh3.uuid] / window.innerWidth) * 0.6;

        var sideArc = (2*Math.PI / 8);
        var halfSideArc = sideArc / 2;
        var modulus1 = mesh1.rotation.y % sideArc;
        var modulus2 = mesh2.rotation.y % sideArc;
        var modulus3 = mesh3.rotation.y % sideArc;
        var springThing1 =  mesh1.rotation.y < 0 ? halfSideArc + modulus1  : modulus1 - halfSideArc; 
        velocities[mesh1.uuid] -=  velocities[mesh1.uuid]*0.4 + springThing1 * 30 ;         
        var springThing2 =  mesh2.rotation.y < 0 ? halfSideArc + modulus2  : modulus2 - halfSideArc; 
        velocities[mesh2.uuid] -=  velocities[mesh2.uuid]*0.4 + springThing2 * 30 ;
        var springThing3 =  mesh3.rotation.y < 0 ? halfSideArc + modulus3  : modulus3 - halfSideArc; 
        velocities[mesh3.uuid] -=  velocities[mesh3.uuid]*0.4 + springThing3 * 30 ;         
        
        playClickSound( oldpos1, mesh1.rotation.y );
        playClickSound( oldpos2, mesh2.rotation.y );
        playClickSound( oldpos3, mesh3.rotation.y );
        
        //which objects are you touching right now?
        touches.forEach(function(touch) {
            if (touch.object) {
                // console.log(touch.object.uuid);            
                fingerDownFactor[touch.object.uuid] = 0.3;
            }
        });    
        //slow down sonny
        velocities[mesh1.uuid] *= 0.96 - fingerDownFactor[mesh1.uuid];
        velocities[mesh2.uuid] *= 0.96 - fingerDownFactor[mesh2.uuid];
        velocities[mesh3.uuid] *= 0.96 - fingerDownFactor[mesh3.uuid];
        
        renderer.render( scene, camera );
    }
    

})(0);
