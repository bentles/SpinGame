var THREE = require('./lib/three.js');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 1000;
var touches = require('./touches.js')(camera, scene);
  
var audioListener = new THREE.AudioListener();
camera.add( audioListener );

var buffer;
var ready = false;
var loader = new THREE.AudioLoader();
loader.load(
	'click.ogg',    
	//loaded
	function ( audioBuffer ) {
        buffer = audioBuffer;
        ready = true;
	},
	//progress
	function ( xhr ) {},
	//errors
	function ( xhr ) {
		console.log( 'An error happened' );
	}
);

var sides = 8;
var width = 350;
var height = 200;
var gap = 20;

var mat11 = new THREE.MeshPhongMaterial( { color: 0xee1111 , shading: THREE.FlatShading, shininess: 0});
var mat12 = new THREE.MeshPhongMaterial( { color: 0x222222, shading: THREE.FlatShading, shininess: 0});
var mat1 = new THREE.MultiMaterial([mat11, mat12]);

var mat21 = new THREE.MeshPhongMaterial( { color: 0x11ee11, shading: THREE.FlatShading, shininess: 0});
var mat22 = new THREE.MeshPhongMaterial( { color: 0x222222, shading: THREE.FlatShading, shininess: 0});
var mat2 = new THREE.MultiMaterial([mat21, mat22]);

var mat31 = new THREE.MeshPhongMaterial( { color: 0x1111ee, shading: THREE.FlatShading, shininess: 0});
var mat32 = new THREE.MeshPhongMaterial( { color: 0x222222, shading: THREE.FlatShading, shininess: 0});
var mat3 = new THREE.MultiMaterial([mat31, mat32]);

var geom1 = new THREE.CylinderGeometry(width, width, height, sides);
var geom2 = new THREE.CylinderGeometry(width, width, height, sides);
var geom3 = new THREE.CylinderGeometry(width, width, height, sides);

var mesh1 = new THREE.Mesh( geom1, mat1 );
mesh1.position.y += height + gap;
var mesh2 = new THREE.Mesh( geom2, mat2 );
var mesh3 = new THREE.Mesh( geom3, mat3 );
mesh3.position.y -= height + gap;

for(var i = 0; i <  mesh1.geometry.faces.length; i++) {
    mesh1.geometry.faces[i].materialIndex = 0;
    mesh2.geometry.faces[i].materialIndex = 0;
    mesh3.geometry.faces[i].materialIndex = 0;
}

mesh1.geometry.faces[0].materialIndex = 1;
mesh2.geometry.faces[0].materialIndex = 1;
mesh3.geometry.faces[0].materialIndex = 1;
mesh1.geometry.faces[15].materialIndex = 1;
mesh2.geometry.faces[15].materialIndex = 1;
mesh3.geometry.faces[15].materialIndex = 1;
mesh1.geometry.faces[7].materialIndex = 1;
mesh2.geometry.faces[7].materialIndex = 1;
mesh3.geometry.faces[7].materialIndex = 1;
mesh1.geometry.faces[8].materialIndex = 1;
mesh2.geometry.faces[8].materialIndex = 1;
mesh3.geometry.faces[8].materialIndex = 1;

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
            velocities[currentTouch.object.uuid] += dX;
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
        audio.setBuffer(buffer);
        audio.setVolume(0.2);
        audio.setPlaybackRate(2);
        audio.play();
    }    
}

(function animate() {
    requestAnimationFrame( animate );

    if (ready) {
        fingerDownFactor[mesh1.uuid] = 0;
        fingerDownFactor[mesh2.uuid] = 0;
        fingerDownFactor[mesh3.uuid] = 0;

        var oldpos1 = mesh1.rotation.y;
        var oldpos2 = mesh2.rotation.y;
        var oldpos3 = mesh3.rotation.y;    

        mesh1.rotation.y += (velocities[mesh1.uuid] / window.innerWidth) * 0.6; 
        mesh2.rotation.y += (velocities[mesh2.uuid] / window.innerWidth) * 0.6; 
        mesh3.rotation.y += (velocities[mesh3.uuid] / window.innerWidth) * 0.6;

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
        velocities[mesh1.uuid] *= 0.98 - fingerDownFactor[mesh1.uuid];
        velocities[mesh2.uuid] *= 0.98 - fingerDownFactor[mesh2.uuid];
        velocities[mesh3.uuid] *= 0.98 - fingerDownFactor[mesh3.uuid];
        
        renderer.render( scene, camera );
    }
    

})();
