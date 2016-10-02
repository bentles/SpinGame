var THREE = require('./lib/three.js');
var scene, camera, renderer;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 1000;

var sides = 6;
var width = 350;
var height = 200;
var gap = 20;

var geom1 = new THREE.CylinderGeometry(width, width, height, sides);
var mat1 = new THREE.MeshPhongMaterial( { color: 0xee0000, shading: THREE.FlatShading } );
var mesh1 = new THREE.Mesh( geom1, mat1 );
mesh1.position.y += height + gap;

var geom2 = new THREE.CylinderGeometry(width, width, height, sides);
var mat2 = new THREE.MeshPhongMaterial( { color: 0x00ee00, shading: THREE.FlatShading } );
var mesh2 = new THREE.Mesh( geom2, mat2 );

var geom3 = new THREE.CylinderGeometry(width, width, height, sides);
var mat3 = new THREE.MeshPhongMaterial( { color: 0x0000ee, shading: THREE.FlatShading } );
var mesh3 = new THREE.Mesh( geom3, mat3 );
mesh3.position.y -= height + gap;

//use the identifier on the mesh to get from the object to their velocities
var velocities = {};
velocities[mesh1.uuid] = 0;
velocities[mesh2.uuid] = 0;
velocities[mesh3.uuid] = 0;

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
directionalLight.position.set( 0, 0, 10 );

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
        //current_shape.material.wireframe = true;
    }
}

function handleTouchMove(e) {
    var touchZero = findTouchZero(e.touches);
    if (touchZero) {
        velocities[current_shape.uuid] += touchZero.clientX - lastKnownTouchX;
        //console.log(velocities[current_shape.uuid]);
        console.log(touchZero.clientX);
        
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
        current_shape.material.wireframe = false;
    }
}

(function animate() {
    requestAnimationFrame( animate );

    mesh1.rotation.y += (velocities[mesh1.uuid] / window.innerWidth) * 0.5; 
    mesh2.rotation.y += (velocities[mesh2.uuid] / window.innerWidth) * 0.5; 
    mesh3.rotation.y += (velocities[mesh3.uuid] / window.innerWidth) * 0.5;

    //slow down sonny
    velocities[mesh1.uuid] *= 0.8;
    velocities[mesh2.uuid] *= 0.8;
    velocities[mesh3.uuid] *= 0.8;
    
    renderer.render( scene, camera );

})();
