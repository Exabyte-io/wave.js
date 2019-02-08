export const UtilsMixin = (superclass) => class extends superclass {

    // toggles a boolean variable and optionally sets all variables in the antagonists array to the opposite value
    toggleBoolean(name, antagonistNames = []) {
        this[name] = !this[name];
        // disable all antagonists when `name` variable is set to true
        const currentValue = this[name];
        if (currentValue && antagonistNames.length) {
            antagonistNames.forEach(antagonistName => {
                this[antagonistName] = !currentValue;
            })
        }
    }

    areTwoObjectsShallowEqual(o1, o2) {
        return Object.keys(o1).map(key => o1[key] === o2[key]).reduce((a, b) => a && b);
    }

    getTwoObjectsShallowDifferentKeys(o1, o2) {
        const resultingObject = {};
        const differentKeysArray = Object.keys(o1).filter(key => o1[key] !== o2[key]);
        differentKeysArray.forEach(key => resultingObject[key] = true);
        return resultingObject;
    }

};
