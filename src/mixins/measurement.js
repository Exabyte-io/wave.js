import * as THREE from "three";
import {CSS2DObject} from "three-css2drender"

/*
 * Mixin containing the logic for dealing with measurement.
 * Draws bond length and angle torsion.
 */
export const MeasurementMixin = (superclass) => class extends superclass {

    constructor(config) {
        super(config);

        this.isDistanceEnabled = false;
        this.isAngleEnabled = false;
        this.isTorsionEnabled = false;
        this.selectedObjects = [];
        this.init();
        this.createMeasurementGroup = this.createMeasurementGroup.bind(this);
        this.selectAtom = this.selectAtom.bind(this);
    }

    init() {
        this.raycaster = new THREE.Raycaster();
        this.lineDashedMaterial = new THREE.LineDashedMaterial( { color: 0xffffff, linewidth: 1, dashSize: 0.10, gapSize: 0.05 } );
        this.meshBasicMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    }

    createMeasurementGroup() {
        this.measurementGroup = new THREE.Group();
        this.measurementGroup.name = "Measurement";
        this.structureGroup.add(this.measurementGroup);
    }

    selectAtom(event) {
        let selectObjects = null;
        for (const child of this.structureGroup.children) {
            if (child.name === "SelectObjects") {
                selectObjects = child.children;
                break;
            }
        }

        if (selectObjects === null) {
            return;
        }

        const intersect = this.getIntersect(event, selectObjects);
        if (intersect === null) return;

        if (this.selectedObjects.includes(intersect)) return;

        if (this.isDistanceEnabled) {
            if (this.selectedObjects.length >= 1) {
                const atom1 = this.selectedObjects[0];
                const atom2 = intersect;
                this.drawDistance(atom1, atom2);
                atom1.material.visible = false;
                this.selectedObjects = [];
            } else {
                intersect.material.visible = true;
                this.selectedObjects.push(intersect);
            }
        } else if (this.isAngleEnabled) {
            if (this.selectedObjects.length >= 2) {
                const atom1 = this.selectedObjects[0];
                const atom2 = this.selectedObjects[1];
                const atom3 = intersect;
                this.drawAngle(atom1, atom2, atom3);
                atom1.material.visible = false;
                atom2.material.visible = false;
                this.selectedObjects = [];
            } else {
                intersect.material.visible = true;
                this.selectedObjects.push(intersect);
            }
        } else if (this.isTorsionEnabled) {
            if (this.selectedObjects.length >= 3) {
                const atom1 = this.selectedObjects[0];
                const atom2 = this.selectedObjects[1];
                const atom3 = this.selectedObjects[2];
                const atom4 = intersect;
                this.drawTorsion(atom1, atom2, atom3, atom4);
                atom1.material.visible = false;
                atom2.material.visible = false;
                atom3.material.visible = false;
                this.selectedObjects = [];
            } else {
                intersect.material.visible = true;
                this.selectedObjects.push(intersect);
            }
        }

        this.render();
    }

    getIntersect(event, selectObjects) {
        const rect = event.target.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.x) / this.WIDTH) * 2 - 1;
        mouse.y = -((event.clientY - rect.y) / this.HEIGHT) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(selectObjects);
        if (intersects.length < 1) return null;
        return intersects[0].object;
    }

    drawDistance(atom1, atom2) {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(atom1.position);
        geometry.vertices.push(atom2.position);
        const line = new THREE.Line(geometry, this.lineDashedMaterial);
        line.computeLineDistances();
        this.measurementGroup.add(line);

        const text = document.createElement('div');
        text.className = 'label';
        text.style.color = 'rgb(255,255,255)';
        text.style.backgroundColor = 'rgba(0,0,0,0.25)';
        text.textContent = this.myRound(atom1.position.distanceTo(atom2.position), 2).toString();
        const label = new CSS2DObject(text);
        label.position.copy(atom1.position);
        label.position.lerp(atom2.position, 0.5);
        this.measurementGroup.add(label);
    }

    drawAngle(atom1, atom2, atom3) {
        const rJI = new THREE.Vector3();
        rJI.subVectors(atom1.position, atom2.position);
        const rJISqLength = rJI.length();
        const rJK = new THREE.Vector3();
        rJK.subVectors(atom3.position, atom2.position);
        const rJKSqLength = rJK.length();
        const angle = rJI.angleTo(rJK);

        const geometry = new THREE.Geometry();
        geometry.vertices.push(atom1.position);
        geometry.vertices.push(atom2.position);
        geometry.vertices.push(atom3.position);
        const line = new THREE.Line(geometry, this.lineDashedMaterial);
        line.computeLineDistances();
        this.measurementGroup.add(line);

        const triangle = new THREE.Triangle(atom1.position, atom2.position, atom3.position);
        const center = new THREE.Vector3();
        triangle.midpoint(center);

        const text = document.createElement('div');
        text.className = 'label';
        text.style.color = 'rgb(255,255,255)';
        text.style.backgroundColor = 'rgba(0,0,0,0.25)';
        text.textContent = this.myRound(THREE.Math.radToDeg(angle), 2).toString() + '°';
        const label = new CSS2DObject(text);
        label.position.copy(center);
        this.measurementGroup.add(label);
    }

    drawTorsion(atom1, atom2, atom3, atom4) {
        const rIJ = new THREE.Vector3();
        rIJ.subVectors(atom2.position, atom1.position);
        const rIJSqLength = rIJ.length();
        const rJK = new THREE.Vector3();
        rJK.subVectors(atom3.position, atom2.position);
        const rJKSqLength = rJK.length();
        const rKL = new THREE.Vector3();
        rKL.subVectors(atom4.position, atom3.position);
        const rKLSqLength = rKL.length();
        const nIJK = rIJ.clone();
        nIJK.cross(rJK);
        const nIJKSqLength = nIJK.length();
        const nJKL = rJK.clone();
        nJKL.cross(rKL);
        const nJKLSqLength = nJKL.length();
        const m = nIJK.clone();
        m.cross(rJK);
        const torsion = -Math.atan2(m.dot(nJKL) / Math.sqrt(nJKLSqLength * m.length()), nIJK.dot(nJKL) / Math.sqrt(nIJKSqLength * nJKLSqLength));

        const geometry = new THREE.Geometry();
        geometry.vertices.push(atom1.position);
        geometry.vertices.push(atom2.position);
        geometry.vertices.push(atom3.position);
        geometry.vertices.push(atom4.position);
        const line = new THREE.Line(geometry, this.lineDashedMaterial);
        line.computeLineDistances();
        this.measurementGroup.add(line);

        const text = document.createElement('div');
        text.className = 'label';
        text.style.color = 'rgb(255,255,255)';
        text.style.backgroundColor = 'rgba(0,0,0,0.25)';
        text.textContent = this.myRound(THREE.Math.radToDeg(torsion), 2).toString() + '°';
        const label = new CSS2DObject(text);
        label.position.copy(atom2.position);
        label.position.lerp(atom3.position, 0.5);
        this.measurementGroup.add(label);
    }

    myRound(number, precision) {
        var shift = function (number, precision, reverseShift) {
            if (reverseShift) {
                precision = -precision;
            }  
            var numArray = ("" + number).split("e");
            return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
        };
        return shift(Math.round(shift(number, precision, false)), precision, true);
    }

};
