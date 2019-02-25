import React from 'react';
import {Made} from "made.js";
import {mount} from 'enzyme';

import {SELECTORS} from "../../selectors";
import {createElement} from "../../utils";
import {ELEMENT_PROPERTIES, MATERIAL_CONFIG} from "../../enums";
import {ThreeDEditor} from "../../../src/components/ThreeDEditor";

test('toggleInteractive', () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)}/>, {attachTo: container});

    // assert view and export buttons are hidden
    expect(wrapper.find(SELECTORS.viewIconToolbar).hasClass("hidden")).toBe(true);
    expect(wrapper.find(SELECTORS.exportIconToolbar).hasClass("hidden")).toBe(true);

    const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
    interactiveButton.prop('onClick')();
    wrapper.update();

    // assert view and export buttons are visible
    expect(wrapper.find(SELECTORS.viewIconToolbar).hasClass("hidden")).toBe(false);
    expect(wrapper.find(SELECTORS.exportIconToolbar).hasClass("hidden")).toBe(false);
});

test('toggleView', () => {
    const container = createElement("div", ELEMENT_PROPERTIES);
    const wrapper = mount(<ThreeDEditor material={new Made.Material(MATERIAL_CONFIG)}/>, {attachTo: container});

    const interactiveButton = wrapper.find(`${SELECTORS.interactiveIconToolbar} button`);
    interactiveButton.prop('onClick')();
    wrapper.update();

    // assert toggle axes button is hidden
    expect(wrapper.find(SELECTORS.toggleAxesRoundIconButton).exists()).toBe(false);

    const viewButton = wrapper.find(`${SELECTORS.viewIconToolbar} button`);
    viewButton.prop('onClick')();
    wrapper.update();

    // assert toggle axes button is visible
    expect(wrapper.find(SELECTORS.toggleAxesRoundIconButton).exists()).toBe(true);
});
