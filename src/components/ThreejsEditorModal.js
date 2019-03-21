import React from 'react';
import * as THREE from "three";
import setClass from "classnames";
import elementClass from "element-class";
import {Modal, ModalBody} from "react-bootstrap";

import {ShowIf} from "./ShowIf";
import settings from "../settings";
import {LoadingIndicator} from "./LoadingIndicator";
import {THREE_D_BASE_URL, THREE_D_SOURCES} from "../enums";
import {materialsToThreeDSceneData, ThreeDSceneDataToMaterial} from "../utils";

export class ThreejsEditorModal extends React.Component {

    constructor(props) {
        super(props);
        window.THREE = THREE;
        this.editor = undefined;
        this.domElement = undefined;
        this.state = {areScriptsLoaded: false};
        this.injectScripts();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.localStorage.removeItem("threejs-editor");
    }

    injectScripts() {
        const clsInstance = this;
        THREE_D_SOURCES.forEach(src => {
            const script = document.createElement("script");
            script.src = `${THREE_D_BASE_URL}/${src}`;
            script.async = false;
            script.defer = false;
            if (src.includes("SetSceneCommand")) {
                script.onload = () => {

                    clsInstance.setState({areScriptsLoaded: true});

                    Number.prototype.format = function () {
                        return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    };

                    clsInstance.editor = new window.Editor();
                    clsInstance.editor.scene.background = new THREE.Color(settings.backgroundColor);

                    var viewport = new window.Viewport(clsInstance.editor);

                    this.domElement.appendChild(viewport.dom);

                    var toolbar = new window.Toolbar(clsInstance.editor);
                    this.domElement.appendChild(toolbar.dom);

                    var script = new window.Script(clsInstance.editor);
                    this.domElement.appendChild(script.dom);

                    var player = new window.Player(clsInstance.editor);
                    this.domElement.appendChild(player.dom);

                    var menubar = new window.Menubar(clsInstance.editor);
                    this.domElement.appendChild(menubar.dom);

                    var sidebar = new window.Sidebar(clsInstance.editor);
                    this.domElement.appendChild(sidebar.dom);

                    var modal = new window.UI.Modal();
                    this.domElement.appendChild(modal.dom);

                    document.addEventListener('dragover', function (event) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';
                    }, false);

                    document.addEventListener('drop', function (event) {
                        if (event.dataTransfer.files.length > 0) {
                            clsInstance.editor.loader.loadFile(event.dataTransfer.files[0]);
                        }
                    }, false);

                    function onWindowResize(event) {clsInstance.editor.signals.windowResize.dispatch()}

                    window.addEventListener('resize', onWindowResize, false);
                    onWindowResize();

                    const loader = new THREE.ObjectLoader();
                    const scene = loader.parse(materialsToThreeDSceneData(this.props.materials));
                    clsInstance.editor.execute(new window.SetSceneCommand(scene));

                }
            }
            document.head.appendChild(script);
        });
    }

    render() {
        const className = setClass(this.props.className, this.props.isFullWidth ? "full-page-overlay" : "");
        if (this.props.show) elementClass(document.body).add('modal-backdrop-color-' + this.props.backdropColor);
        return (
            <Modal
                id={this.props.modalId}
                animation={false}
                show={this.props.show}
                onHide={(e) => {
                    this.props.onHide(ThreeDSceneDataToMaterial(this.editor.scene.toJSON()));
                    elementClass(document.body).remove('modal-backdrop-color-' + this.props.backdropColor);
                }}
                className={className}
            >
                <ModalBody className="p-0">
                    <div id="threejs-editor" ref={el => {this.domElement = el}}/>
                    <ShowIf condition={!this.state.areScriptsLoaded}>
                        <LoadingIndicator/>
                    </ShowIf>
                </ModalBody>
            </Modal>
        )
    }

}

ThreejsEditorModal.propTypes = {
    materials: React.PropTypes.array,
    modalId: React.PropTypes.string,
    show: React.PropTypes.bool,
    onHide: React.PropTypes.func,
    title: React.PropTypes.string,
    className: React.PropTypes.string,
    isFullWidth: React.PropTypes.bool,
    backdropColor: React.PropTypes.string
};

ThreejsEditorModal.defaultProps = {
    isFullWidth: true,
    backdropColor: 'white',
};
