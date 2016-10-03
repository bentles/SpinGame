var THREE = require('./lib/three.js');
var scene, camera, renderer;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 1000;

var audioListener = new THREE.AudioListener();
camera.add( audioListener );
var clickSound = new THREE.Audio( audioListener );

scene.add( clickSound );
var loader = new THREE.AudioLoader();

loader.load(
	'click.ogg',    
	// Function when resource is loaded
	function ( audioBuffer ) {
		// set the audio object buffer to the loaded object
		clickSound.setBuffer( audioBuffer );
	},
	// Function called when download progresses
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// Function called when download errors
	function ( xhr ) {
		console.log( 'An error happened' );
	}
);

var sides = 8;
var width = 350;
var height = 200;
var gap = 20;

var geom1 = new THREE.CylinderGeometry(width, width, height, sides);
var mat1 = new THREE.MeshPhongMaterial( { color: 0xee0000, shading: THREE.FlatShading, shininess: 0});
var mesh1 = new THREE.Mesh( geom1, mat1 );
mesh1.position.y += height + gap;

var geom2 = new THREE.CylinderGeometry(width, width, height, sides);
var mat2 = new THREE.MeshPhongMaterial( { color: 0x00ee00, shading: THREE.FlatShading, shininess: 0});
var mesh2 = new THREE.Mesh( geom2, mat2 );

var geom3 = new THREE.CylinderGeometry(width, width, height, sides);
var mat3 = new THREE.MeshPhongMaterial( { color: 0x0000ee, shading: THREE.FlatShading, shininess: 0});
var mesh3 = new THREE.Mesh( geom3, mat3 );
mesh3.position.y -= height + gap;

//use the identifier on the mesh to get from the object to their velocities
var velocities = {};
velocities[mesh1.uuid] = 0;
velocities[mesh2.uuid] = 0;
velocities[mesh3.uuid] = 0;

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set( 1, 0, 5 );

var lastKnownTouchX = undefined;
var lastKnownTouchY = undefined;

var current_shape = undefined;

scene.add( mesh1 );
scene.add( mesh2 );
scene.add( mesh3 );
scene.add( directionalLight );

renderer = new THREE.WebGLRenderer({antialias : true});
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

renderer.render( scene, camera );

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(e) {
    lastKnownTouchY = e.touches[0].clientY;
    lastKnownTouchX = e.touches[0].clientX;
    
    var x = 2 * (e.touches[0].clientX / window.innerWidth) - 1;
    var y = 1 - 2 * (e.touches[0].clientY / window.innerHeight);

    var vector = new THREE.Vector3(x, y, 1).unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
        current_shape = intersects[0].object;
    }
}

function handleTouchMove(e) {
    var touchZero = findTouchZero(e.touches);
    if (touchZero) {
        velocities[current_shape.uuid] += touchZero.clientX - lastKnownTouchX;        
        lastKnownTouchX = touchZero.clientX;
        lastKnownTouchY = touchZero.clientY;  
    }
}

function findTouchZero(touches) {
    //TODO: is this really how you do this though?
    for(var i = 0; i < touches.length; i++) {
        if (touches[i].identifier === 0)
            return touches[i];
    }

    return undefined;
}

function handleTouchEnd(e) {
    //until I know what I want to do with multiple touches let's pretend others don't exist :)
    var touchZero = findTouchZero(e.changedTouches);
    
    if (touchZero && current_shape) {
        lastKnownTouchX = undefined;
        
        current_shape.material.wireframe = false;
    }
}

function speedFactor(x) {
    //sigmoid absolute x with tails that are further away... yeah
    var j = 1.3;
    return j/(1 + Math.exp(-Math.abs(x)/ 300)) + 1-(j/2);
}

(function animate() {
    requestAnimationFrame( animate );

    var oldpos1 = mesh1.rotation.y;
    var oldpos2 = mesh2.rotation.y;
    var oldpos3 = mesh3.rotation.y;    

    mesh1.rotation.y += (velocities[mesh1.uuid] / window.innerWidth) * 0.6; 
    mesh2.rotation.y += (velocities[mesh2.uuid] / window.innerWidth) * 0.6; 
    mesh3.rotation.y += (velocities[mesh3.uuid] / window.innerWidth) * 0.6;

    if(Math.floor(oldpos1/ (Math.PI*0.25)) !== Math.floor(mesh1.rotation.y / (Math.PI*0.25)) ||
       Math.floor(oldpos2/ (Math.PI*0.25)) !== Math.floor(mesh2.rotation.y / (Math.PI*0.25)) ||
       Math.floor(oldpos3/ (Math.PI*0.25)) !== Math.floor(mesh3.rotation.y / (Math.PI*0.25))) {
        clickSound.playbackRate = (1 + (Math.random() - 0.5) * 0.1) * speedFactor(velocities[mesh1.uuid]);
        
        clickSound.play();
    }

    var fingerDownFactor = lastKnownTouchX === undefined ?  0 : 0.3;
    //slow down sonny
    velocities[mesh1.uuid] *= 0.96 - fingerDownFactor;
    velocities[mesh2.uuid] *= 0.96 - fingerDownFactor;
    velocities[mesh3.uuid] *= 0.96 - fingerDownFactor;
    
    renderer.render( scene, camera );

})();
