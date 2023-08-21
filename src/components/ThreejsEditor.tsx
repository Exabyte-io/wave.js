// @ts-ignore
import { Made } from "@exabyte-io/made.js";
import { Box } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
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

    return null; // This component is just for side effects, it doesn't render anything
}

interface ThreejsEditorProps {
    materials: Made.Material[];
}
export function ThreejsEditor({ materials }: ThreejsEditorProps): JSX.Element {
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
                <camera position={[-20, 0, 10]} lookAt={} />
                <ThreejsScene materials={materials} />
            </Canvas>
        </Box>
    );
}
