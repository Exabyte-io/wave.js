// @ts-ignore
import { Made } from "@exabyte-io/made.js";
import { Box } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { materialsToThreeDSceneData } from "../utils";

interface ThreejsSceneProps {
    materials: Made.Material[];
}

function ThreejsScene({ materials }: ThreejsSceneProps): JSX.Element | null {
    const { scene } = useThree();

    useEffect(() => {
        const loader = new THREE.ObjectLoader();
        const loadedScene = loader.parse(materialsToThreeDSceneData(materials));
        console.log(loadedScene);
        // Merges the loaded objects into the existing scene.
        scene.add(...loadedScene.children);
    }, [materials, scene]);

    return null; // This component doesn't render anything visually itself
}

interface ThreejsEditorProps {
    materials: Made.Material[];
}

export function ThreejsEditor({ materials }: ThreejsEditorProps): JSX.Element {
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    useEffect(() => {
        if (cameraRef.current) {
            cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
        }
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup actions (equivalent to componentWillUnmount)
            window.localStorage.removeItem("threejs-editor");
        };
    }, []);

    return (
        <Box sx={{ width: "100vw", height: "100vh" }}>
            <Canvas style={{ background: "black" }}>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <perspectiveCamera
                    ref={cameraRef}
                    position={new THREE.Vector3(-20, 0, 10)}
                    up={new THREE.Vector3(0, 0, 1)}
                />
                <ThreejsScene materials={materials} />
            </Canvas>
        </Box>
    );
}
