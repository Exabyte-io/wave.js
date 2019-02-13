import React from 'react';
import {Made} from "made.js";
import {shallow} from 'enzyme';

import {MATERIAL_CONFIG} from "../../enums";
import {ThreeDEditor} from "../../../src/components/ThreeDEditor";

test('ThreeDEditor Base Test', async () => {
    const component = shallow(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)}/>);
    expect(component).toMatchSnapshot();
});
