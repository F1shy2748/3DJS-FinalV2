import './style.css'
import * as THREE from 'three'
import { addLight, addLightBack } from './addLights'
import Model from './Model'
import Clickable from './Clickable'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js'
import { environment } from './environment'
import { postprocessing } from './postprocessing'

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
)
camera.position.set(3, 2, 5)

//Raycast
const pointer = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
let active = false;

//Current Active
let activeScene = { name: null, light: null }

//Globals
const meshes = {}
const lights = {}
const mixers = []
const clock = new THREE.Clock()
const controls = new OrbitControls(camera, renderer.domElement)
const interactables = []
const defaultPosition = new THREE.Vector3(3, 2, 5)
const composer = postprocessing(scene, camera, renderer)
const AnimationMixer= new THREE.AnimationMixer();

init()
function init() {
	renderer.toneMapping = THREE.ACESFilmicToneMapping
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)

	//lights
	lights.defaultLight = addLight()
	lights.backLight = addLightBack()


	scene.environment = environment();
	scene.add(lights.defaultLight)
	scene.add(lights.backLight)

	addInteraction()
	raycast()
	models()
	resize()
	animate()
}

function models() {
	const akMag = new Model({
		name: 'mag',
		scene: scene,
		meshes: meshes,
		url: 'ak.glb',
		replace: false,
		scale: new THREE.Vector3(0.1, 0.1, 0.1),
		mixers: mixers,
		animationState: true,
		//positions: new THREE.pvector.Vectors(-0.2, -1, 0)
	})
	akMag.init()
}

function raycast() {
	window.addEventListener('click', (event) => {

		pointer.x = (event.clientX / window.innerWidth) * 2 - 1
		pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
		raycaster.setFromCamera(pointer, camera)

		const intersects = raycaster.intersectObjects(interactables, true)
		for (let i = 0; i < intersects.length; i++) {
			const object = intersects[0].object.parent
			unreveal(object.userData.name);
			if (object.userData.name === activeScene.name) {
				for(let i = 1; i < mixers.length; i++){
					mixers[0].clipAction(mixers[i]).stop()
				}
				unreveal(object.userData.name);
				if(active){
					if(object.userData.name === "tagTop"){
						var action = mixers[0].clipAction(mixers[1]);
						action.setLoop( THREE.LoopOnce );
						action.clampWhenFinished = true;
						action.play();
					}
					if(object.userData.name === "tagLatches"){
						var action = mixers[0].clipAction(mixers[3]);
						action.setLoop( THREE.LoopOnce );
						action.clampWhenFinished = true;
						action.play();
						var action2 = mixers[0].clipAction(mixers[5]);
						action2.setLoop( THREE.LoopOnce );
						action2.clampWhenFinished = true;
						action2.play();
					}
					if(object.userData.name === "tagBack"){
						var action = mixers[0].clipAction(mixers[3]);
						action.setLoop( THREE.LoopOnce );
						action.clampWhenFinished = true;
						action.play();
						var action2 = mixers[0].clipAction(mixers[5]);
						action2.setLoop( THREE.LoopOnce );
						action2.clampWhenFinished = true;
						action2.play();
						var action3 = mixers[0].clipAction(mixers[7]);
						action3.setLoop( THREE.LoopOnce );
						action3.clampWhenFinished = true;
						action3.play();
					}
				}
				deactivate(object.userData.name, object);
			} else {
				reveal(object.userData.name);
				activate(object.userData.name, object)
				activeScene.name = object.userData.name
				activeScene.light = object
				for(let i = 1; i < mixers.length; i++){
					mixers[0].clipAction(mixers[i]).stop()
				}
				if(object.userData.name === "tagTop"){
					var action = mixers[0].clipAction(mixers[2]);
					action.setLoop( THREE.LoopOnce );
					action.clampWhenFinished = true;
					action.play();
				}
				if(object.userData.name === "tagLatches"){
					var action = mixers[0].clipAction(mixers[4]);
					action.setLoop( THREE.LoopOnce );
					action.clampWhenFinished = true;
					action.play();
					var action2 = mixers[0].clipAction(mixers[6]);
					action2.setLoop( THREE.LoopOnce );
					action2.clampWhenFinished = true;
					action2.play();
				}
				if(object.userData.name === "tagBack"){
					var action = mixers[0].clipAction(mixers[4]);
					action.setLoop( THREE.LoopOnce );
					action.clampWhenFinished = true;
					action.play();
					var action2 = mixers[0].clipAction(mixers[6]);
					action2.setLoop( THREE.LoopOnce );
					action2.clampWhenFinished = true;
					action2.play();
					var action3 = mixers[0].clipAction(mixers[8]);
					action3.setLoop( THREE.LoopOnce );
					action3.clampWhenFinished = true;
					action3.play();
				}
			}
		}
	})
}

function reveal(name) {
	gsap.to(`.${name}` , {
		opacity: 1,
		duration: 3,
	})
}

function unreveal(name) {
	gsap.to(`.${name}` , {
		opacity: 0,
		duration: 1,
	})
}

function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}

function animate() {
	requestAnimationFrame(animate)
	const delta = clock.getDelta()

	if(mixers.length>0){	
		mixers[0].update(delta)
	
	}
	
	 



	renderer.render(scene, camera)
	//composer.composer.render();
}

function deactivate(modalName, light) {
	active = false;
	light.intensity = 0
	light.activate = false
	moveTarget({ x: 0, y: 0, z: 0 })
	moveCamera(defaultPosition, undefined)
}

function activate(modalName, light) {
	active = true;
	light.intensity = 1
	light.activate = true
	moveTarget({ ...light.position })
	moveCamera(light.userData.lookAt, modalName)
}

function moveTarget({ x, y, z }) {
	gsap.to(controls.target, {
		x: x,
		y: y - 1.0,
		z: z,
		duration: 2,
		ease: 'power3.inOut',
		onUpdate: () => {
			controls.update()
		},
	})
}

function moveCamera(position, targetName) {
	if (targetName === undefined) {
		gsap.to(camera.position, {
			x: position.x,
			y: position.y,
			z: position.z,
			duration: 2,
			ease: 'power3.inOut',
		})
	}
	gsap.to(camera.position, {
		x: position.x,
		y: position.y,
		z: position.z,
		duration: 2,
		ease: 'power3.inOut',
	})
}

function addInteraction() {
	const tagLatches = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagLatches',
		position: new THREE.Vector3(1.108, 1.443, -0.916),
		lookPosition: new THREE.Vector3(2.354, 1.927, -1.717),
		container: interactables,
	})
	tagLatches.init();

	const tagTop = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagTop',
		position: new THREE.Vector3(0.379, 2.218, -0.163),
		lookPosition: new THREE.Vector3(1.747, 3.573, 0.688),
		lookRotation: new THREE.Vector3(-62.16, 58.25, 36.02),
		container: interactables,
	})
	tagTop.init();

	const tagSticker = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagSticker',
		position: new THREE.Vector3(1.755, -0.675, -0.252),
		lookPosition: new THREE.Vector3(3.451, -0.948, 1.195),
		lookRotation: new THREE.Vector3(102.80, 77.48, -103.10),
		container: interactables,
	})
	tagSticker.init();

	const tagBack = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagBack',
		position: new THREE.Vector3(0.087, 1.841, -1.821),
		lookPosition: new THREE.Vector3(2.887, 1.626, -4.302),
		lookRotation: new THREE.Vector3(-154.85, 38.95, 163.69),
		container: interactables,
	})
	tagBack.init();

	const tagMag = new Clickable({
		intensity: 0,
		scene: scene,
		lights: lights,
		name: 'tagMag',
		position: new THREE.Vector3(-0.897, 1.441, 0.361),
		lookPosition: new THREE.Vector3(-1.8, 0.394, 2.819),
		container: interactables,
	})
	tagMag.init();
}

