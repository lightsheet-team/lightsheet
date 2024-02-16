// @ts-nocheck
import React, { useRef, useEffect } from "react";
import jSuites from '../../dist/jsuites';

// @ts-ignore
export default React.forwardRef((props, mainReference) => {
    // Dom element
    const Ref = useRef(null);

    // Get the properties for the spreadsheet
    let options = { ...props };

    useEffect(() => {
        // @ts-ignore
        if (!Ref.current.innerHTML) {
            mainReference.current = jSuites.dropdown(Ref.current, options);
        }
    }, []);

    let prop = {
        ref: Ref,
        style: { height: '100%', width: '100%' }
    };

    return React.createElement("div", prop);
})