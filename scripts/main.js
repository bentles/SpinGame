var THREE = require('./lib/three.js');

var scene, camera, renderer;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 1000;

var touchcolor = 0xcccccc;
var nontouchcolor = 0;
var current = nontouchcolor;

var sides = 6;
var width = 350;
var height = 200;
var gap = 20;

var geom1 = new THREE.CylinderGeometry(width, width, height, sides);
var mat1 = new THREE.MeshBasicMaterial( { color: 0xee0000, wireframe: true } );
var mesh1 = new THREE.Mesh( geom1, mat1 );
mesh1.position.y += height + gap;

var geom2 = new THREE.CylinderGeometry(width, width, height, sides);
var mat2 = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true } );
var mesh2 = new THREE.Mesh( geom2, mat2 );

var geom3 = new THREE.CylinderGeometry(width, width, height, sides);
var mat3 = new THREE.MeshBasicMaterial( { color: 0x0000ee, wireframe: true } );
var mesh3 = new THREE.Mesh( geom3, mat3 );
mesh3.position.y -= height + gap;

scene.add( mesh1 );
scene.add( mesh2 );
scene.add( mesh3 );

renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

renderer.render( scene, camera );


document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);
//document.addEventListener('mousedown', handleTouchStart, false);

function handleTouchStart(e) {
    var x = 2 * (e.touches[0].clientX / window.innerWidth) - 1;
    var y = 1 - 2 * (e.touches[0].clientY / window.innerHeight);

    var vector = new THREE.Vector3(x, y, 1).unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children);

    console.log(intersects);
    
    if (intersects.length > 0) {
        current = intersects[0].object.material.color.getHex();
    }
}

function handleTouchEnd(e) {
    //totally won't fall over with multiple touches.... totally
    current = nontouchcolor;
}

(function animate() {
    requestAnimationFrame( animate );
    renderer.setClearColor ( current, 1);

    mesh1.rotation.y += 0.02;
    mesh2.rotation.y -= 0.02;
    mesh3.rotation.y += 0.02;
  
    renderer.render( scene, camera );

})();
