const Reflex = (() => {
    /**
    * Our constructor for our Reflex virtual element
    *
    * @param type | element name | type: string
    * @param props | object of node properties | type: object
    * @param children | content for the element | type: array
    *
    * @return object
    */
    const h = (type, props, ...children) => {
        return {
            type,
            props: props || {}, //onClick, className
            children
        }
    };

    /**
    * Testing for Event Props passed to Reflex instance. We are testing if the 
    * starting string of the event is 'on'.
    *
    * @param prop name 
    */
    const isEventProp = name => /^on/.test(name); // -> true / false

    /**
    * Adding custom props to elements
    *
    * @param name | name of the custom prop
    */
    const isCustomProp = name => isEventProp(name) || name === "forceUpdate";

    /**
    * Extract the Event listener
    *
    * @param name | name of event listener to remove the 'on' phrase from
    */
    const extractEventName = name => name.slice(2).toLowerCase(); // onClick -> "click"

    /**
    * Set Props to the element
    *
    * @param target | where the prop is being set
    * @param name | name of the prop
    * @param value | value of the prop
    *
    * @return void
    */
    const setProp = (target, name, value) => {
        if (isCustomProp(name)){
            return;
        } else if (name === "className"){
            target.setAttribute("class", value);
        } else {
            target.setAttribute(name, value);
        }
    };

    /**
    * Remove properties
    *
    * @param target | element from which prop will be removed
    * @param name | name of prop to be removed
    * @param value | value of prop to be removed
    *
    * @return void
    */
    const removeProp = (target, name, value) => {
        if (isCustomProp(name)){
            return;
        } else if (name === "className"){
            target.removeAttribute("class", value);
        } else {
            target.removeAttribute(name);
        }
    };

    /**
    * Set Prop to the passed element
    *
    * @param target | element of which props will be set
    * @param props | prop of which will be set on to the element
    */
    const setProps = (target, props) => {
        Object.keys(props).forEach(name => {
            setProp(target, name, props[name]);
        });
    };

    /**
    * Update prop on an element
    *
    * @param target | element of which to update the prop
    * @param name | name of the prop to be updated
    * @param newValue | the value of the new prop
    * @param oldValue | the value fo the old prop if it is set
    */
    const updateProp = (target, name, newValue, oldValue) => {
        if (!newVal){
            removeProp(target, name, oldValue);
        } else if (!oldValue || newValue !== oldValue) {
            setProp(target, name, newValue);
        }
    };

    /**
    * update props looper method
    *
    * @param target | the element of which will be looped over and props will be updated
    * @param newProps | props to be added to the target element
    * @param oldProps | if oldProps are present, they will be removed in the updateProp method
    */
    const updateProps = (target, newProps, oldProps = {}) => {
        const props = Object.assign({}, newProps, oldProps);
        Object.keys(props).forEach(name => {
            updateProp(target, name, newProps[name], oldProps[name]);
        });
    };

    /**
    * Add event listeners to target element
    *
    * @param target | element of which to add event listeners
    * @param props | properties to be added to the event listeners
    */
    const addEventListeners = (target, props) => {
        Object.keys(props).forEach(name => {
            if(isEventProp(name)){
                target.addEventListener(extractEventName(name), props[name]);
            }
        });
    };

    /**
    * Create Virtual DOM
    *
    * @param node | the kind of element node to be created
    *
    * @return void
    */
    const createElement = (node) => {
        if(typeof node === "string"){
            return document.createTextNode(node);
        }

        const el = document.createElement(node.type);
        setProps(el, node.props);
        addEventListeners(el, node.props);
        node.children.map(createElement).forEach(el.appendChild.bind(el));
        return el;
    };

    /**
    * Check if the node has changed
    *
    * @param node1 | the original node
    * @param node2 | the new node that could be the same or different
    *
    * @return function
    */
    function changed(node1, node2){
        return(
            typeof node1 !== typeof node2 ||
            (typeof node1 === 'string' && node1 !== node2) ||
            node1.type !== node2.type
        )
    }

    /**
    * Update Node if needed
    *
    * @param parent | the parent of the node to be updated
    * @param newNode | the newNode to be added if node has changed
    * @param oldNode | the old node for checking if the node has changed
    * @param index | the index of the node of the parent to me updated
    */
    function update(parent, newNode, oldNode, index = 0){
        if(!oldNode){
            parent.appendChild(createElement(newNode));
        } else if (!newNode){
            parent.removeChild(parent.childNodes[index]);
        } else if (changed(newNode, oldNode)){
            parent.replaceChild(createElement(newNode), parent.childNodes[index]);
        } else if (newNode.type){
            updateProps(parent.childNodes[index], newNode.props, oldNode.props);
            const newLength = newNode.children.length;
            const oldLength = oldNode.children.length;

            for(let i = 0; i < newLength || i < oldLength; i++){
                update(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
            }
        }
    }

    // return Reflex Object
    return {
        h,
        update
    }
})();

const el = Reflex.h("h2", {}, "Hello World!");
console.log(el);

Reflex.update(document.body, el);