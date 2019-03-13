import React from 'react';
import ReactDOM from 'react-dom';
import {Made} from "@exabyte-io/made.js";

import "./stylesheets/wave.scss";

import {ThreeDEditor} from './components/ThreeDEditor';

const material = new Made.Material(Made.defaultMaterialConfig);
ReactDOM.render(<ThreeDEditor material={material}/>, document.getElementById('root'));
