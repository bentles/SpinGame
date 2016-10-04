var THREE = require('./lib/three.js');

function createTouches(camera, scene) {
    var touches = [];

    function getObject(screenX, screenY) {
        var x = 2 * (screenX / window.innerWidth) - 1;
        var y = 1 - 2 * (screenY / window.innerHeight);

        var vector = new THREE.Vector3(x, y, 1).unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersected = raycaster.intersectObjects(scene.children);
        
        return (intersected.length > 0)? intersected[0].object : undefined;        
    }
    
    return {
        touches : touches, //TODO: nuke this line later I just want it for debugging
        get : function(i) {
            return touches[i] ? touches[i] : {}; //I want getTouch(i).x to be undefined if it doesn't exist
        },
        set : function(i, touch) {
            touches[i] = {x : touch.clientX,
                          y : touch.clientY,
                          object : getObject(touch.clientX,touch.clientY)};
        },
        nuke : function(i) {
            touches[i] = undefined;
        }
    };    
}

module.exports = createTouches;
