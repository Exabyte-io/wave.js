import React from 'react';
import {shallow} from 'enzyme';
import renderer from 'react-test-renderer';

class Welcome extends React.Component {
    render() {
        return (
            <div>Hello world</div>
        );
    }
}

describe('Welcome', () => {
    it('renderer', () => {
        const component = renderer.create(<Welcome/>);
        const json = component.toJSON();
        expect(json).toMatchSnapshot();
    });

    it('enzyme', () => {
        const welcome = shallow(<Welcome/>);
        expect(welcome.find('div').text()).toEqual('Hello world');
    });
});
