import React from 'react';
import {Made} from "made.js";
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css';
import "./stylesheets/wave.scss";

import {ThreeDEditor} from './components/ThreeDEditor';

const material = new Made.Material(Made.defaultMaterialConfig);
ReactDOM.render(<ThreeDEditor material={material}/>, document.getElementById('root'));
