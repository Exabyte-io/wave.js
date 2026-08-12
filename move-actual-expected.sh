#!/bin/bash

# Baselines live in the `expected/` subdirectory, matching
# tests/utils.js::getExpectedImageFilePath. The freshly-rendered `.actual.png` files are
# written to the snapshot directory itself (and are gitignored).
basedir=tests/__tests__/__snapshots__
expecteddir=${basedir}/expected
expected=.expected.png
actual=.actual.png
save=.save.png

if [[ "$1" == "forward" ]]; then
    echo "Saving existing expected images"
    for fl in ${expecteddir}/*${expected}; do
        [[ -e "${fl}" ]] || continue
        basename=${fl##*/}
        rootname=${basename/${expected}/}
        echo "cp ${fl} ${expecteddir}/${rootname}${save}"
        cp "${fl}" "${expecteddir}/${rootname}${save}"
    done

    echo "Copying actual images to expected (if they exist)"
    for fl in ${basedir}/*${actual}; do
        [[ -e "${fl}" ]] || continue
        basename=${fl##*/}
        rootname=${basename/${actual}/}
        echo "cp ${fl} ${expecteddir}/${rootname}${expected}"
        cp "${fl}" "${expecteddir}/${rootname}${expected}"
    done
elif [[ "$1" == "backward" ]]; then
    echo "Moving saved images back to expected"
    for fl in ${expecteddir}/*${save}; do
        [[ -e "${fl}" ]] || continue
        basename=${fl##*/}
        rootname=${basename/${save}/}
        echo "mv ${fl} ${expecteddir}/${rootname}${expected}"
        mv "${fl}" "${expecteddir}/${rootname}${expected}"
    done
else
    echo "
Due to inconsistencies in the treatment of line objects in WebGL, there is no
guarantee that a given system configuration produces identical PNGs for objects
using THREE.Line objects (including all the unit cells in the expected images).
This script migrates actual images to expected images.

Note:
    Regenerated baselines are only safe to commit when the environment that
    produced them is known to agree with CI on line rendering - i.e. when the
    committed baselines passed unmodified in that same environment immediately
    before the change being baselined. Verify that first, then diff the new
    images visually: a baseline refresh should show only the change you made.

Please provide an argument [forward|backward]
"
fi
