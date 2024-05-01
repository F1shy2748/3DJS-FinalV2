import * as THREE from 'three'

export function addLight() {
	const light = new THREE.DirectionalLight(0xffffff, 4)
	light.position.set(7.503, 9.860, 9.904)
	return light
}

export function addLightBack() {
	const light = new THREE.DirectionalLight(0xffffff, 2)
	light.position.set(-0.518, 2.269, -4.640)
	return light
}


