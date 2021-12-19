const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0xb7c3f3, 1 );

const light = new THREE.AmbientLight( 0x4ffffff );
scene.add( light );
camera.position.z = 5;

// global variables
const start_position = 4
const end_position = -4
const text = document.querySelector(".text")
const timeLimit = 20
let gameStatus = "loading"
let isLookingBack = true

function delay(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}

const loader = new THREE.GLTFLoader();
class Doll {
	constructor() {
		loader.load("../models/scene.gltf", (gltf) => {
			scene.add( gltf.scene );
			gltf.scene.scale.set(.35,.35,.35);
			gltf.scene.position.set(0,-1,0);
			this.doll = gltf.scene;
		})
	}
	lookBackward(){
		gsap.to(this.doll.rotation, {y: -3.15, duration: .5})
		setTimeout(() => isLookingBack = true, 150)
	}	
	lookForward(){
		gsap.to(this.doll.rotation, {y: 0, duration: .5})
		setTimeout(() => isLookingBack = false, 500)
	}
	async start(){
		this.lookBackward()
		await delay((Math.random() * 1000) + 1000)
		this.lookForward()
		await delay((Math.random() * 750) + 750)
		this.start()
	}
}

function createCube(size, positionX, rotationY, color){
	const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
	const material = new THREE.MeshBasicMaterial( { color: color } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.x = positionX;
	cube.rotation.y = rotationY;
	scene.add( cube );
	return cube;
}

function createTrack(){
	createCube({w:start_position*2  + .2, h:1.5, d:1}, 0, 0, 0xe5a716).position.z = -1
	createCube({w:.2, h:1.5, d:1}, start_position, -.35, 0xff1493)
	createCube({w:.2, h:1.5, d:1}, end_position, .35, 0xff1493)
}
createTrack()

class Player {
	constructor(){
		const geometry = new THREE.RingGeometry( .2, .3, 32 );
		const material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
		const mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );
		mesh.position.z = 1
		mesh.position.x = start_position
		this.player = mesh
		this.playerInfo =  {
			positionX : start_position,
			velocity : 0
		}
	}
	run(){
		this.playerInfo.velocity = .013
	}

	stop(){
		gsap.to(this.playerInfo, {velocity: 0, duration: .2})
	}

	check(){
		if(this.playerInfo.velocity > 0 && !isLookingBack){
			text.innerText = "Bang! You're dead."
			gameStatus = "over"
		}
		if(this.playerInfo.positionX < end_position + .4){
			text.innerText = "Bravo! You're safe."
			gameStatus = "over"
		}
	}

	update(){
		this.check()
		this.playerInfo.positionX -= this.playerInfo.velocity;
		this.player.position.x = this.playerInfo.positionX;
	}
}

const player = new Player()
let doll = new Doll()

async function init() {
	await delay(700)
	text.innerText = "Starting in 3"
	await delay(700)
	text.innerText = "Starting in 2"
	await delay(700)
	text.innerText = "Starting in 1"
	await delay(700)
	text.innerText = "Go"
	startGame()
}

function startGame() {
	gameStatus = "started"
	let progressBar = createCube({w:5, h:.1, d:1}, 0, 0, 0x00e600)
	progressBar.position.y = 3.3
	gsap.to(progressBar.scale, {x:0, duration:timeLimit, ease:"none"})
	doll.start()
	setTimeout(() => {
		if(gameStatus != "over"){
			text.innerText = "Oops! Time's Up."
			gameStatus = "over"
		}
	},timeLimit*1000);
}

init()

function animate() {
	if(gameStatus == "over"){
		return
	}
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	player.update()
}
animate();

window.addEventListener( 'resize', onWindowResize, false);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix;
	renderer.setSize( window.innerWidth, window.innerHeight);
}

window.addEventListener( 'keydown', (e) => {
	if(gameStatus != "started"){
		return
	}
	if(e.key == "ArrowLeft"){
		player.run()
	}
} )

window.addEventListener( 'keyup', (e) => {
	if(e.key == "ArrowRight"){
		player.stop()
	}
} )

