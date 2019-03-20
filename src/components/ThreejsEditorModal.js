import React from 'react';
import * as THREE from "three";
import {ModalBody} from "react-bootstrap";

import {ShowIf} from "./ShowIf";
import ModalDialog from "./ModalDialog";
import {materialsToThreeDSceneData} from "../utils";
import {LoadingIndicator} from "./LoadingIndicator";
import {THREE_D_BASE_URL, THREE_D_SOURCES} from "../enums";

export class ThreejsEditorModal extends ModalDialog {

    constructor(props) {
        super(props);
        window.THREE = THREE;
        this.domElement = undefined;
        this.state = {areScriptsLoaded: false};
        this.injectScripts();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.localStorage.removeItem("threejs-editor");
    }

    injectScripts() {
        THREE_D_SOURCES.forEach(src => {
            const script = document.createElement("script");
            script.src = `${THREE_D_BASE_URL}/${src}`;
            script.async = false;
            script.defer = false;
            if (src.includes("SetSceneCommand")) {
                script.onload = () => {

                    this.setState({areScriptsLoaded: true});

                    Number.prototype.format = function () {
                        return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    };

                    var editor = new window.Editor();

                    var viewport = new window.Viewport(editor);
                    this.domElement.appendChild(viewport.dom);

                    var toolbar = new window.Toolbar(editor);
                    this.domElement.appendChild(toolbar.dom);

                    var script = new window.Script(editor);
                    this.domElement.appendChild(script.dom);

                    var player = new window.Player(editor);
                    this.domElement.appendChild(player.dom);

                    var menubar = new window.Menubar(editor);
                    this.domElement.appendChild(menubar.dom);

                    var sidebar = new window.Sidebar(editor);
                    this.domElement.appendChild(sidebar.dom);

                    var modal = new window.UI.Modal();
                    this.domElement.appendChild(modal.dom);

                    function onWindowResize(event) {editor.signals.windowResize.dispatch()}

                    document.addEventListener('dragover', function (event) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';
                    }, false);

                    document.addEventListener('drop', function (event) {
                        event.preventDefault();
                        editor.loader.loadFiles(event.dataTransfer.files);
                    }, false);

                    window.addEventListener('resize', onWindowResize, false);
                    onWindowResize();

                    var loader = new window.THREE.ObjectLoader();
                    var result = loader.parse(materialsToThreeDSceneData(this.props.materials));
                    editor.execute(new window.SetSceneCommand(result));

                }
            }
            document.head.appendChild(script);
        });
    }

    renderHeader() {
        return null;
    }

    renderFooter() {
        return null;
    }

    renderBody() {
        return <ModalBody className="p-0">
            <div ref={el => {this.domElement = el}}/>
            <ShowIf condition={!this.state.areScriptsLoaded}>
                <LoadingIndicator/>
            </ShowIf>
        </ModalBody>;
    }

}

ThreejsEditorModal.propTypes = {
    onSubmit: React.PropTypes.func,
};

ThreejsEditorModal.defaultProps = {
    isFullWidth: true,
    backdropColor: 'white',
};
