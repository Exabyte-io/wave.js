import React from 'react';
import * as THREE from "three";
import {ModalHeader, ModalFooter} from "react-bootstrap";

import ModalDialog from "./ModalDialog";
import {materialsToThreeDSceneData} from "../utils";
import {THREE_D_BASE_URL, THREE_D_SOURCES, THREE_D_STYLESHEETS} from "../enums";

export class ThreeDEditorModal extends ModalDialog {

    constructor(props) {
        super(props);
        window.THREE = THREE;
        THREE_D_STYLESHEETS.forEach(config => {
            const script = document.createElement("link");
            script.rel = "stylesheet";
            script.href = `${THREE_D_BASE_URL}/${config.href}`;
            script.id = config.id || '';
            document.head.appendChild(script);
        });

        THREE_D_SOURCES.forEach(src => {
            const script = document.createElement("script");
            script.src = `${THREE_D_BASE_URL}/${src}`;
            script.async = false;
            script.defer = false;
            document.head.appendChild(script);
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        window.localStorage.removeItem("threejs-editor");
    }

    renderHeader() {
        return (
            <ModalHeader closeButton={true} className="border-bottom">
                <h4 className="modal-title">{this.props.title}</h4>
            </ModalHeader>
        )
    }

    renderBody() {
        return <div ref={el => {

            if (!el) return;

            Number.prototype.format = function () {
                return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
            };

            var editor = new window.Editor();

            var viewport = new window.Viewport(editor);
            el.appendChild(viewport.dom);

            var toolbar = new window.Toolbar(editor);
            el.appendChild(toolbar.dom);

            var script = new window.Script(editor);
            el.appendChild(script.dom);

            var player = new window.Player(editor);
            el.appendChild(player.dom);

            var menubar = new window.Menubar(editor);
            el.appendChild(menubar.dom);

            var sidebar = new window.Sidebar(editor);
            el.appendChild(sidebar.dom);

            var modal = new window.UI.Modal();
            el.appendChild(modal.dom);

            function onWindowResize(event) {editor.signals.windowResize.dispatch()}

            window.addEventListener('resize', onWindowResize, false);
            onWindowResize();

            var loader = new window.THREE.ObjectLoader();
            var result = loader.parse(materialsToThreeDSceneData(this.props.materials));
            if (result.isScene) {
                editor.execute(new window.SetSceneCommand(result));

            } else {
                editor.execute(new window.AddObjectCommand(result));

            }

        }}/>;
    }

    renderFooter() {
        return (
            <ModalFooter>
            </ModalFooter>
        );
    }

}

ThreeDEditorModal.propTypes = {
    onSubmit: React.PropTypes.func,
};

ThreeDEditorModal.defaultProps = {
    isFullWidth: true,
    backdropColor: 'white',
};
