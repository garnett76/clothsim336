/**
 * 
 * start boiler plate
 * 
**/

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';

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

camera.position.set(3, 0, 5);
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
var y_particles = 15;


var mass = 1;
var clothSize = 1;

//distance between each particle
var dist = clothSize / x_particles;

//stores linked particles
var particles = [];


let particle_mass;
for(let i = 0; i < x_particles + 1; i++){
    particles.push([]);
    for(let j = 0; j < y_particles + 1; j++){
        //if particle is at the top of the cloth, set particle_mass to 0
        if(j == y_particles){
            particle_mass = 0;
        }
        //if particle is not on the top of the cloth, set particle_mass to mass
        else if(j != y_particles){
            particle_mass = mass;
        }
        //set mass, shape, and position
        var particle = new CANNON.Body({mass: particle_mass, shape: new CANNON.Particle(), position: new CANNON.Vec3((i - x_particles * 0.5) * dist, (j - y_particles * 0.5) * dist, 0), velocity: new CANNON.Vec3(0, 0, -0.1 * (y_particles - j))
        });
        //console.log(particle.mass)
        //push to particle subarray
        particles[i].push(particle);
        //add particle to world
        world.addBody(particle)
    }
}

//connect the particles
function connect_particles(i1, j1, i2, j2){
    world.addConstraint(new CANNON.DistanceConstraint(
        particles[i1][j1],
        particles[i2][j2],
        dist
    ));
}

//call connect_particles on each member of the cloth
for(let i = 0; i < x_particles + 1; i++){
    for(let j = 0; j < y_particles + 1; j++){
        if(i < x_particles){
            connect_particles(i, j, i+1, j);
        }
        if(j < y_particles){
            connect_particles(i, j, i, j+1)
        }
    }
}

var clothGeometry = new THREE.PlaneGeometry(1, 1, x_particles, y_particles)
var clothMat = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: new THREE.TextureLoader().load('./isu.jpg')})
var clothMesh = new THREE.Mesh(clothGeometry, clothMat)
scene.add(clothMesh)

//align particles with cloth vertices
function updateParticles(){
    for(let i = 0; i < x_particles + 1; i++){
        for(let j = 0; j < y_particles+1; j++){
            var index = j * (x_particles + 1) + i;

            //x,y,z of each vertices in the cloth
            var positionAttribute = clothGeometry.attributes.position

            var clothX = clothGeometry.attributes.x
            var clothY = clothGeometry.attributes.y
            var clothZ = clothGeometry.attributes.z

            //position of the particle
            var particleX = particles[i][y_particles - j].position.x
            var particleY = particles[i][y_particles - j].position.y
            var particleZ = particles[i][y_particles - j].position.z
            
            console.log(particleX + ', ' + particleY + ', ' + particleZ)

            //set cloth vertice x, y, z equal to cannon particle x, y, z
            positionAttribute.setXYZ(index, particleX, particleY, particleZ)

            //update cloth vertice position
            positionAttribute.needsUpdate = true
        }
    }
}


/**
 * 
 * start boiler plate
 * 
**/
var timeStep = 1/60

function animate(time) {
    updateParticles();
    world.step(timeStep);
    renderer.render(scene, camera);
    
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