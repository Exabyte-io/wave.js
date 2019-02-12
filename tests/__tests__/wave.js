import React from 'react';
import {Made} from "made.js";
import {shallow} from 'enzyme';

import {takeSnapshotAndAssertEquality} from "../utils";
import {getWaveInstance, MATERIAL_CONFIG} from "../enums";
import {ThreeDEditor} from "../../src/components/ThreeDEditor";

test('draw silicon', async () => {
    const wave = getWaveInstance();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "si");
});

test('draw silicon with toggled axes', async () => {
    const wave = getWaveInstance();
    wave.toggleAxes();
    return takeSnapshotAndAssertEquality(wave.renderer.context, "siWithAxes");
});

test('ThreeDEditor Base Test', async () => {
    const component = shallow(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)}/>);
    expect(component).toMatchSnapshot();
});
