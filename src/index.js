import React from 'react';
import ReactDOM from 'react-dom';
import {Made} from "@exabyte-io/made.js";

import "./stylesheets/main.scss";

import {ThreeDEditor} from './components/ThreeDEditor';

const material = new Made.Material(Made.defaultMaterialConfig);
window.wave = ReactDOM.render(<ThreeDEditor editable={true} material={material}/>, document.getElementById('root'));
