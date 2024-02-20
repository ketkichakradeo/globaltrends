
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (d3) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var d3__namespace = /*#__PURE__*/_interopNamespaceDefault(d3);

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.58.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.58.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let label;
    	let t1;
    	let input;
    	let t2;
    	let div1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "2000";
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			attr_dev(label, "id", "label");
    			add_location(label, file, 2, 8, 41);
    			attr_dev(input, "id", "year-slider");
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "2000");
    			attr_dev(input, "max", "2015");
    			input.value = "2000";
    			add_location(input, file, 3, 8, 80);
    			attr_dev(div0, "class", "overlay");
    			add_location(div0, file, 1, 4, 11);
    			attr_dev(div1, "id", "map");
    			add_location(div1, file, 5, 4, 170);
    			add_location(main, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);
    			append_dev(div0, input);
    			append_dev(main, t2);
    			append_dev(main, div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const geojsonUrl = "static/world_energy_data2.geojson";

    function updateLabel() {
    	const slider = document.getElementById('year-slider');
    	const label = document.getElementById('label');
    	label.textContent = slider.value;
    }

    function plotChoroplethMap(map, data) {
    	if (map.getSource('countries')) {
    		map.removeSource('countries');
    	}

    	if (map.getLayer('countries-fill')) {
    		map.removeLayer('countries-fill');
    	}

    	// map.getSource('countries') && map.removeSource('countries');
    	// map.getLayer('countries-fill') && map.removeLayer('countries-fill');
    	// Add GeoJSON source and layer
    	map.addSource('countries', {
    		type: 'geojson',
    		data: {
    			type: 'FeatureCollection',
    			features: Object.values(data).map(d => ({
    				type: 'Feature',
    				geometry: d.geometry,
    				properties: { gdp: d.gdp }
    			}))
    		}
    	});

    	map.addLayer({
    		id: 'countries-fill',
    		type: 'fill',
    		source: 'countries',
    		layout: {},
    		paint: {
    			'fill-color': [
    				'interpolate',
    				['linear'],
    				['get', 'gdp'],
    				0,
    				'#f7f7f7',
    				1000000000,
    				'#6EED8C',
    				5000000000,
    				'#4DCD7D',
    				10000000000,
    				'#31B057',
    				50000000000,
    				'#238D45',
    				100000000000,
    				'#005A32'
    			],
    			'fill-opacity': 0.8
    		}
    	});
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	mapboxgl.accessToken = "pk.eyJ1Ijoia3F0cmFuIiwiYSI6ImNsc2t6eXQ4czA3dmcyanJ5eWhoaWQxeHIifQ.2kwe8rDh1r-X61ULATh_Jg";
    	let geojsonData;

    	d3__namespace.json(geojsonUrl).then(data => {
    		geojsonData = data;
    		initializeMap();
    	});

    	// const map = new mapboxgl.Map({
    	//         container: "map",
    	//         style: "mapbox://styles/mapbox/light-v11" , //mapbox://styles/kqtran/clsp8c8fo000601qz77zx4z2t", 
    	//         center: [-79.035728, 35.932522], // Chapel Hill Public Library
    	//         zoom: 2,
    	//         minZoom: 1,
    	//         maxZoom: 15,
    	//     });
    	async function initializeMap() {
    		//create mapbox map
    		const map = new mapboxgl.Map({
    				container: "map",
    				style: "mapbox://styles/mapbox/light-v11", //mapbox://styles/kqtran/clsp8c8fo000601qz77zx4z2t", 
    				center: [-79.035728, 35.932522], // Chapel Hill Public Library
    				zoom: 2,
    				minZoom: 1,
    				maxZoom: 15
    			});

    		const response = await fetch(geojsonUrl);
    		geojsonData = await response.json();
    		const slider = document.getElementById('year-slider');

    		slider.addEventListener('input', () => {
    			updateLabel();
    			updateMap(map);
    		});

    		updateLabel();
    		updateMap();
    	}

    	// function to update map based on slider value
    	function updateMap(map) {
    		const selectedYear = parseInt(document.getElementById('year-slider').value);
    		const aggregatedData = aggregateDataByYear(selectedYear);
    		plotChoroplethMap(map, aggregatedData);
    	}

    	function aggregateDataByYear(selectedYear) {
    		const aggregatedData = {};

    		geojsonData.features.forEach(feature => {
    			// const properties = feature.properties;
    			const country = feature.properties.country;

    			const year = feature.properties.year;

    			if (year === selectedYear) {
    				if (!aggregatedData[country]) {
    					aggregatedData[country] = { gdp: 0, geometry: feature.geometry };
    				}

    				aggregatedData[country] += feature.properties.gdp;
    			}
    		});

    		console.log(aggregatedData);
    		return aggregatedData;
    	}

    	// let aggregatedData = aggregateDataByYear(2015)
    	// let slider_label = ""
    	initializeMap();

    	// function aggregateDataByYear(selectedYear){
    	//     const aggregatedData = {};
    	//     geojsonData.features.forEach(feature => {
    	//         const properties = feature.properties;
    	//         const country = properties.country;
    	//         const year = properties.year;
    	//         if (year === selectedYear){
    	//             if (!aggregatedData[country]){
    	//                 aggregatedData[country] = {gdp: 0, geometry: feature.geometry};
    	//             }
    	//             aggregatedData[country] += properties.gdp;
    	//         } 
    	//     });
    	//     return aggregatedData;
    	// }
    	// let aggregatedData = aggregateDataByYear(2015)
    	// // https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson'
    	// map.on('load', function  () {
    	//     map.addSource('countries', {
    	//         type: 'geojson',
    	//         data: 'static/world_energy_data2.geojson'
    	//     });
    	//     // let desiredYear = 2010;
    	//     // map.getSource('countries').setData({
    	//     //     type: 'FeatureCollection',
    	//     //     features: geojson.features.filter(function (feature) {
    	//     //         // Assuming each feature has a "properties" object containing information about the feature, including the year
    	//     //         return feature.properties.year === desiredYear;
    	//     //     })
    	//     // });
    	//     map.addLayer({
    	//         'id': 'countries',
    	//         'type': 'fill',
    	//         'source': 'countries',
    	//         'layout': {},
    	//         'paint': {
    	//             'fill-color': ['interpolate',
    	//             ['linear'],
    	//             ['get', 'gdp'], // Property in GeoJSON representing GDP
    	//             0, '#FFEDA0', // Define color stops based on GDP values
    	//             10000000, '#FED976',
    	//             50000000, '#FEB24C',
    	//             100000000, '#FD8D3C',
    	//             500000000, '#FC4E2A',
    	//             1000000000, '#E31A1C',
    	//             5000000000, '#BD0026',
    	//             10000000000, '#800026'],
    	//             'fill-opacity': 0.7 // Opacity
    	//             }
    	//      });
    	// });
    	let slider_time = 2015;

    	let currYear = "";
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		d3: d3__namespace,
    		geojsonUrl,
    		geojsonData,
    		initializeMap,
    		updateLabel,
    		updateMap,
    		aggregateDataByYear,
    		plotChoroplethMap,
    		slider_time,
    		currYear
    	});

    	$$self.$inject_state = $$props => {
    		if ('geojsonData' in $$props) geojsonData = $$props.geojsonData;
    		if ('slider_time' in $$props) slider_time = $$props.slider_time;
    		if ('currYear' in $$props) currYear = $$props.currYear;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})(d3);
//# sourceMappingURL=bundle.js.map
