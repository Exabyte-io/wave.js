// @ts-ignore
import { Made } from "@exabyte-io/made.js";
import { Box } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { materialsToThreeDSceneData } from "../utils";
import { WaveComponent } from "./WaveComponent";

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

function Camera() {
    const { camera, gl } = useThree();
    useEffect(() => {
        camera.position.set(-20, 0, 10);
        camera.up.set(0, 0, 1);
        camera.lookAt(new THREE.Vector3(1, 1, 1));

        const controls = new OrbitControls(camera, gl.domElement);
        return () => controls.dispose();
    }, [camera, gl]);

    return null;
}

interface ThreejsEditorProps {
    materials: Made.Material[];
}

export class ThreejsEditor extends WaveComponent {
    // eslint-disable-next-line no-useless-constructor
    constructor(props: ThreejsEditorProps) {
        super(props);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    componentDidMount() {}

    componentWillUnmount() {
        // Cleanup actions (equivalent to useEffect with return statement)
        window.localStorage.removeItem("threejs-editor");
    }

    render() {
        return (
            <Box sx={{ width: "100vw", height: "100vh" }}>
                <Canvas style={{ background: "black" }}>
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />
                    <Camera />
                    <ThreejsScene materials={this.props.materials} />
                </Canvas>
            </Box>
        );
    }
}
