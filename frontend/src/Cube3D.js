import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const Cube3D = ({ cubeState }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);

    // Create cube faces
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const materials = cubeState.map(color => new THREE.MeshBasicMaterial({ color }));
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, [cubeState]);

  return <div ref={mountRef} style={{ width: "400px", height: "400px" }} />;
};

export default Cube3D;
