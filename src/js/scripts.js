/**
 * 
 * start boiler plate
 * 
**/

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xA3A3A3);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    24,
    window.innerWidth / window.innerHeight,
    1,
    2000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 5, 15);
camera.lookAt(0, 0, 0);

orbit.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight)

const spotLight = new THREE.SpotLight(0xffffff, 0.9, 0, Math.PI / 8, 1);
spotLight.position.set(-3, 3, 10);
spotLight.target.position.set(0, 0, 0);

scene.add(spotLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 0, -10);
directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
});

/**
 * 
 * end boiler plate
 * 
**/

//number of particles on x axis
var x_particles = 15;

//number of particles on y axis
var y_particles = 23;


var mass = 0.05;

//stores linked particles
var particles = [];

var current_cape = 0;

for(let i = 0; i < 16; i++){
    particles[i] = []
}


let particle_mass;
for(let i = 0; i < x_particles + 1; i++){
    // console.log(i)
    // console.log(particles.length)

    for(let j = 0; j < y_particles + 1; j++){

        //if particle is at the top of the cloth, set particle_mass to 0
        if(j == y_particles){
            particle_mass = 0;
        }
        //if particle is not on the top of the cloth, set particle_mass to mass
        else if(j != y_particles){
            particle_mass = mass;
        }

        
        particleX = (i - x_particles * 0.5) * 0.04
        particleY = ((j - y_particles * 0.5) * 0.04) + 0.3
        particleZ = 0.3

        //set mass, shape, and position
        var particle = new CANNON.Body({mass: particle_mass,
                                        shape: new CANNON.Particle(),
                                        position: new CANNON.Vec3(particleX, particleY, particleZ),
                                        velocity: new CANNON.Vec3(0, 0, 0.1)
        });
        //console.log(particle.mass)

        //add newly created particle to particles
        particles[i][j] = particle

        //add particle to world
        world.addBody(particle)
    }
}


//call add DistanceContstraint between particles
for(let i = 0; i < x_particles + 1; i++){
    for(let j = 0; j < y_particles + 1; j++){
        if(i < x_particles){
            world.addConstraint(new CANNON.DistanceConstraint(particles[i][j], particles[i+1][j], 0.04));
        }
        if(j < y_particles){
            world.addConstraint(new CANNON.DistanceConstraint(particles[i][j], particles[i][j+1], 0.04));
        }
    }
}


//cloth 
var clothGeo = new THREE.PlaneGeometry(0, 0, x_particles, y_particles)
var clothMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,
                                            color: '#BA1C1C' //red,
                                            //map: new THREE.TextureLoader().load('./isu.jpg')
                                            })

var clothMesh = new THREE.Mesh(clothGeo, clothMat)
clothMesh.visible = true
scene.add(clothMesh)

//grass
var cylinderGeometry2 = new THREE.CylinderGeometry( 5, 5, 0.1, 20);
var material2 = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: new THREE.TextureLoader().load('./grass.jpg')})
var cylinder2 = new THREE.Mesh(cylinderGeometry2, material2);
cylinder2.position.set(0,-1.3,0)
scene.add(cylinder2)

//hidden box to prevent cloth from clipping into the dude's torso
var boxGeo = new THREE.BoxGeometry(0.8, 1, 0.5)
var boxMat = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: '#0000FF' //blue
});
var boxMesh = new THREE.Mesh(boxGeo, boxMat);
boxMesh.visible = false
scene.add(boxMesh)

var boxBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.5, 0.25))
})

boxBody.position.set(0,0.42,-0.02)
world.addBody(boxBody)
boxMesh.position.copy(boxBody.position)


//another hidden box to prevent cloth from clipping into the dude's upper back
var boxGeo2 = new THREE.BoxGeometry(0.2, 0.2, 0.2)
var boxMat2 = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: '#FFFF00'
});
var boxMesh2 = new THREE.Mesh(boxGeo2, boxMat2);
boxMesh2.visible = false
scene.add(boxMesh2)

var boxBody2 = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1))
})

boxBody2.position.set(0,0.62,0.2)
world.addBody(boxBody2)
boxMesh2.position.copy(boxBody2.position)


//another hidden box to prevent cloth from clipping into the dude's legs
var boxGeo3 = new THREE.BoxGeometry(0.6, 1.2, 0.2)
var boxMat3 = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: '#00FF00'
});
var boxMesh3 = new THREE.Mesh(boxGeo3, boxMat3);
boxMesh3.visible = false
scene.add(boxMesh3)

var boxBody3 = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(0.3, 0.6, 0.1))
})

boxBody3.position.set(0,-0.6, 0.05)
world.addBody(boxBody3)
boxMesh3.position.copy(boxBody3.position)


//add sphere to move around through cloth
var sphereGeo = new THREE.SphereGeometry(0.3);
var sphereMat = new THREE.MeshPhongMaterial();
var sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
sphereMesh.visible = false;
scene.add(sphereMesh)

var sphereShape = new CANNON.Sphere(0.4)
sphereBody = new CANNON.Body({
    shape: sphereShape
})

sphereBody.position.set(0,0, -0.5)

world.addBody(sphereBody)
sphereMesh.position.copy(sphereBody.position)

//Turbine code (ends at 261)

var cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20, 10, false);
var cylinderMat = new THREE.MeshBasicMaterial({
    color: 0xcfcfcf
});
var cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMat);
cylinderMesh.scale.set(0.5, 1, 0.5);
cylinderMesh.position.set(0,0,1);

var rotorGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 20, 10, false);
var rotorMat = new THREE.MeshBasicMaterial({
    color: 0x9e9782
});
var rotorMesh = new THREE.Mesh(rotorGeometry, rotorMat);
rotorMesh.scale.set(0.5, 1, 1);
rotorMesh.rotation.z = Math.PI / 2;
rotorMesh.rotation.y = -Math.PI / 2;
rotorMesh.position.set(0, 0.3, 0);

cylinderMesh.add(rotorMesh);

var pivot = new THREE.Object3D();
pivot.position.set(0,0,0);
rotorMesh.add(pivot);
var blade1Geometry = new THREE.SphereGeometry(0.075, 30, 30);
var blade1Mat = new THREE.MeshBasicMaterial({
    color: 0x5b804f
});
var blade1 = new THREE.Mesh(blade1Geometry, blade1Mat);
blade1.position.set(0, 0.2, 0.525);
blade1.scale.set(1, 0.05, 6);
pivot.add(blade1);

var blade2 = new THREE.Mesh(blade1Geometry, blade1Mat);
blade2.position.set(0, 0.2, -0.525);
blade2.scale.set(1, 0.05, 6);
pivot.add(blade2);


scene.add(cylinderMesh);

//end of turbine


//dude: https://poly.pizza/m/3wn-0Holuje
const loader = new GLTFLoader();

loader.load( './dude.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );



// //flagpole
// var cylinderGeometry = new THREE.CylinderGeometry( 0.01, 0.01, 3, 3);
//const material = new THREE.MeshPhongMaterial();
// const cylinder = new THREE.Mesh( cylinderGeometry, material );
// cylinder.position.set(0.5,-1.15,0)
// scene.add(cylinder)

// //flagpole top
// const sphereGeometry = new THREE.SphereGeometry(0.05);
// const sphereMat = new THREE.MeshPhongMaterial();
// const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMat);
// sphereMesh.position.set(0.5, 0.4, 0)
// scene.add(sphereMesh);


//align particles with cloth vertices
function update(){
    for(let i = 0; i < x_particles + 1; i++){
        for(let j = 0; j < y_particles + 1; j++){
            
            var a = j * (x_particles + 1);
            var b = i;
            var index = a + b

            //position of the particle
            var particleX = particles[i][y_particles - j].position.x
            var particleY = particles[i][y_particles - j].position.y
            var particleZ = particles[i][y_particles - j].position.z
            
            clothGeo.attributes.position.setXYZ(index, particleX, particleY, particleZ)

            //update cloth vertice position
            clothGeo.attributes.position.needsUpdate = true
        }
    }
}

// Wind update (ends at 383)

function updateWind(force) {
    for(let i = 0; i < x_particles + 1; i++) {
        for(let j = 0; j < y_particles + 1; j++) {
            var particleX = particles[i][j].position.x;
            var particleY = particles[i][j].position.y;
            var particleZ = particles[i][j].position.z;

            var rotorX = cylinderMesh.position.x;
            var rotorY = cylinderMesh.position.y;
            var rotorZ = cylinderMesh.position.z;

            var distToRotor = Math.sqrt(Math.pow((particleX - rotorX), 2) +
                Math.pow((particleY - rotorY), 2) +
                Math.pow((particleZ - rotorZ), 2));

            var distX = -force * (rotorX - particleX);
            var distY = -force * (rotorY - particleY);
            var distZ = -force * (rotorZ - particleZ);

            //I realized that this is just the vector of the angles formed by the components
            //of the vector from the sphere to the cloth
            // var forceP = new _cannonEs.Vec3(distX/distToRotor,
            //                                      distY/distToRotor,
            //                                      distZ/distToRotor);

            var forceX = 1/distX;
            var forceY = 1/distY;
            var forceZ = 10/distZ;

            if(forceX < 0){
                forceX = Math.max(-3, forceX);
            }
            else{
                forceX = Math.min(3, forceX);
            }

            if(forceY < 0){
                forceY = Math.max(-3, forceY);
            }
            else{
                forceY = Math.min(3, forceY);
            }

            if(forceZ < 0){
                forceZ = Math.max(-30, forceZ);
            }
            else{
                forceZ = Math.min(30, forceZ);
            }

            var forceP = new CANNON.Vec3(forceX, forceY, forceZ );
            particles[i][j].applyForce(forceP);

            // var velocityP = new _cannonEs.Vec3(0, 0, .1)


            // if(particles[i][j].velocity.z > 0) {
            //     particles[i][j].velocity.z = -0.1 / distToSphere;
            // }else{
            //     particles[i][j].velocity.z = 0.001 / distToSphere;
            // }
        }
    }
}

/**
 * 
 * start boiler plate
 * 
**/
var timeStep = 1/60
// var spawnSphere = false
// var init_run = false
var sphereMovementZ = false
var sphereMovementX = false

// Power and angle declaration

var power = 1, angle = 0;
let wind = false;
function animate(time) {
    window.onkeypress = handleKeyPress;
    update();

    //updating wind and turbine
    if(wind == true){
        updateWind(power);
    }
    pivot.rotation.y = power * 10 * (angle++) * (Math.PI/180);

    world.step(timeStep);
    renderer.render(scene, camera);

    if(sphereMovementZ == true){
        sphereMesh.visible = true;
        sphereBody.position.set(0, 0, 0.5 * Math.cos(time/1000));
        sphereMesh.position.copy(sphereBody.position)
    }
    if(sphereMovementX == true){
        sphereMesh.visible = true;
        sphereBody.position.set(0.6 * Math.sin(time / 1000), 0, 0.1);
        sphereMesh.position.copy(sphereBody.position)
    }
    
}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * 
 * end boiler plate
 * 
**/

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
    if (event.which == null) {
        return String.fromCharCode(event.keyCode)
    } else if (event.which!=0 && event.charCode!=0) {
        return String.fromCharCode(event.which)
    } else {
        return null
    }
}

function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
	case ' ':
		paused = !paused;
		break;
	case 'z':
        console.log('z')
        sphereMovementZ = !sphereMovementZ;
        sphereMovementX = false;
        sphereMesh.visible = !(sphereMesh.visible)
		break;
	case 'c':
        console.log('c')
        boxMesh.visible = !(boxMesh.visible)
        boxMesh2.visible = !(boxMesh2.visible)
        boxMesh3.visible = !(boxMesh3.visible)
		break;
	case 'x':
        console.log('x')
        sphereMovementX = !sphereMovementX;
        sphereMovementZ = false;
        sphereMesh.visible = !(sphereMesh.visible)
		break;
    case 'f':
        console.log('f')
        console.log(current_cape)
        current_cape++;
        if(current_cape == 0){
            scene.remove(clothMesh)
            clothMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,
                                                color: '#BA1C1C' //red,
                                                })
    
            clothMesh = new THREE.Mesh(clothGeo, clothMat)
            scene.add(clothMesh)
        }
        else if(current_cape == 1){
            scene.remove(clothMesh)
            clothMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,
                                                //color: '#BA1C1C' //red,
                                                map: new THREE.TextureLoader().load('./check64border.png')
                                                })
    
            clothMesh = new THREE.Mesh(clothGeo, clothMat)
            scene.add(clothMesh)
        }

        else if(current_cape == 2){
            scene.remove(clothMesh)
            clothMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide,
                                                //color: '#BA1C1C' //red,
                                                map: new THREE.TextureLoader().load('./isu.jpg')
                                                })
    
            clothMesh = new THREE.Mesh(clothGeo, clothMat)
            scene.add(clothMesh)
            current_cape = -1;
        }

		break;
       //Turbine controls
        case 'j':
            cylinderMesh.position.x -= 0.05;
            break;
        case 'l':
            cylinderMesh.position.x += 0.05;
            break;
        case 'i':
            cylinderMesh.position.z -= 0.05;
            break;
        case 'k':
            cylinderMesh.position.z += 0.05;
            break;
        //decrease power
        case 'p':
            power += 0.5;
            break;
        //more power
        case 'P':
            power -= 0.5;
            break;
        case 'w':
            wind = !wind;
            break;

		default:
			return;
	}
}