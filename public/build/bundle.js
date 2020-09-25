
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.26.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    class Gameboard {
        constructor(size, difficulty) {
            this.size = size;
            this.candies = [];
            this.difficulty = difficulty;
        }

        popCandies() {
            function randomInt(size) {
                return Math.floor(Math.random() * size)
            }
            // TODO : Do not let candies appear on the snake body
            this.candies = [...this.candies, [randomInt(this.size), randomInt(this.size)]];
        }

        // TODO
        over() {
            console.log("you've lost");
        }
    }

    class Snake {
        constructor(board, x, y) {
            this.gameboard = board;
            this.head = [x, y];
            this.tail = [];
        }

        // FIXME - Factorise the 4 following methods
        left() {
            let x, y;
            [x, y] = [...this.head];
            this.tail.push(this.head);
            this.head = (x === 0) ? [this.gameboard.size - 1, y] : [x - 1, y];
            if (this.tail.includes(this.head))
                this.gameboard.over();
            if (!this.presenceOfFood())
                this.tail.pop();
        }

        right() {
            let x, y;
            [x, y] = [...this.head];
            this.tail.push(this.head);
            this.head = (x === this.gameboard.size - 1) ? [0, y] : [x + 1, y];
            this.gameboard.popCandies();
            if (this.tail.includes(this.head))
                this.gameboard.over();
            if (!this.presenceOfFood())
                this.tail.pop();
        }

        up() {
            let x, y;
            [x, y] = [...this.head];
            this.tail.push(this.head);
            this.head = (y === 0) ? [x, this.gameboard.size - 1] : [x, y - 1];
            if (this.tail.includes(this.head))
                this.gameboard.over();
            if (!this.presenceOfFood())
                this.tail.pop();
        }

        down() {
            let x, y;
            [x, y] = [...this.head];
            this.tail.push(this.head);
            this.head = (y === this.gameboard.size - 1) ? [x, 0] : [x, y + 1];
            if (this.tail.includes(this.head))
                this.gameboard.over();
            if (!this.presenceOfFood())
                this.tail.pop();
        }

        // private
        presenceOfFood() {
            return this.gameboard.candies.includes(this.head)
        }
    }

    /* src/Components/Settings.svelte generated by Svelte v3.26.0 */

    const file = "src/Components/Settings.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let h2;
    	let t1;
    	let div0;
    	let p0;
    	let input0;
    	let t3;
    	let div1;
    	let p1;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Game Settings";
    			t1 = space();
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Difficulty :";
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Size :";
    			input1 = element("input");
    			attr_dev(h2, "class", "svelte-12xc8md");
    			add_location(h2, file, 18, 2, 219);
    			add_location(p0, file, 20, 4, 254);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file, 20, 23, 273);
    			add_location(div0, file, 19, 2, 244);
    			add_location(p1, file, 23, 4, 347);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file, 23, 17, 360);
    			add_location(div1, file, 22, 2, 337);
    			attr_dev(div2, "id", "settings");
    			attr_dev(div2, "class", "svelte-12xc8md");
    			add_location(div2, file, 17, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*game*/ ctx[0].difficulty);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div1, input1);
    			set_input_value(input1, /*game*/ ctx[0].size);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[1]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*game*/ 1 && to_number(input0.value) !== /*game*/ ctx[0].difficulty) {
    				set_input_value(input0, /*game*/ ctx[0].difficulty);
    			}

    			if (dirty & /*game*/ 1 && to_number(input1.value) !== /*game*/ ctx[0].size) {
    				set_input_value(input1, /*game*/ ctx[0].size);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);
    	let { game } = $$props;
    	const writable_props = ["game"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		game.difficulty = to_number(this.value);
    		$$invalidate(0, game);
    	}

    	function input1_input_handler() {
    		game.size = to_number(this.value);
    		$$invalidate(0, game);
    	}

    	$$self.$$set = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    	};

    	$$self.$capture_state = () => ({ game });

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [game, input0_input_handler, input1_input_handler];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { game: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game*/ ctx[0] === undefined && !("game" in props)) {
    			console.warn("<Settings> was created without expected prop 'game'");
    		}
    	}

    	get game() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Gameboard.svelte generated by Svelte v3.26.0 */

    const file$1 = "src/Components/Gameboard.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (85:6) {#each Array(game.size) as _, y}
    function create_each_block_1(ctx) {
    	let div;
    	let div_class_value;
    	let div_head_value;
    	let div_tail_value;
    	let div_candy_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`game-square-${(/*y*/ ctx[9] + /*x*/ ctx[7]) % 2}`) + " svelte-ccisia"));
    			attr_dev(div, "head", div_head_value = JSON.stringify(/*snake*/ ctx[0].head) === JSON.stringify([/*x*/ ctx[7], /*y*/ ctx[9]]));
    			attr_dev(div, "tail", div_tail_value = /*snake*/ ctx[0].tail.includes([/*x*/ ctx[7], /*y*/ ctx[9]]));
    			attr_dev(div, "candy", div_candy_value = /*game*/ ctx[1].candies.includes([/*x*/ ctx[7], /*y*/ ctx[9]]));
    			add_location(div, file$1, 85, 8, 1389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*snake*/ 1 && div_head_value !== (div_head_value = JSON.stringify(/*snake*/ ctx[0].head) === JSON.stringify([/*x*/ ctx[7], /*y*/ ctx[9]]))) {
    				attr_dev(div, "head", div_head_value);
    			}

    			if (dirty & /*snake*/ 1 && div_tail_value !== (div_tail_value = /*snake*/ ctx[0].tail.includes([/*x*/ ctx[7], /*y*/ ctx[9]]))) {
    				attr_dev(div, "tail", div_tail_value);
    			}

    			if (dirty & /*game*/ 2 && div_candy_value !== (div_candy_value = /*game*/ ctx[1].candies.includes([/*x*/ ctx[7], /*y*/ ctx[9]]))) {
    				attr_dev(div, "candy", div_candy_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(85:6) {#each Array(game.size) as _, y}",
    		ctx
    	});

    	return block;
    }

    // (83:2) {#each Array(game.size) as _, x}
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let each_value_1 = Array(/*game*/ ctx[1].size);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("row") + " svelte-ccisia"));
    			add_location(div, file$1, 83, 4, 1322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*JSON, snake, game*/ 3) {
    				each_value_1 = Array(/*game*/ ctx[1].size);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(83:2) {#each Array(game.size) as _, x}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let each_value = Array(/*game*/ ctx[1].size);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Gameboard";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-ccisia");
    			add_location(h2, file$1, 80, 0, 1243);
    			attr_dev(div, "id", "gameboard");
    			attr_dev(div, "class", "svelte-ccisia");
    			add_location(div, file$1, 81, 0, 1262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, game, JSON, snake*/ 3) {
    				each_value = Array(/*game*/ ctx[1].size);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gameboard", slots, []);
    	let { snake } = $$props;
    	let { game } = $$props;
    	let keyPressed;
    	let interval;

    	let move = () => {
    		switch (keyPressed) {
    			case "z":
    				snake.up();
    				break;
    			case "s":
    				snake.down();
    				break;
    			case "q":
    				snake.left();
    				break;
    			case "d":
    				snake.right();
    				break;
    		}

    		// svelte only renders new assignements...
    		$$invalidate(0, snake);
    	};

    	// handling movements
    	document.onkeypress = e => {
    		keyPressed = e.key;
    		move();
    		clearInterval(interval);

    		interval = setInterval(
    			() => {
    				move();
    			},
    			1000 / game.difficulty
    		);
    	};

    	const writable_props = ["snake", "game"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gameboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("snake" in $$props) $$invalidate(0, snake = $$props.snake);
    		if ("game" in $$props) $$invalidate(1, game = $$props.game);
    	};

    	$$self.$capture_state = () => ({ snake, game, keyPressed, interval, move });

    	$$self.$inject_state = $$props => {
    		if ("snake" in $$props) $$invalidate(0, snake = $$props.snake);
    		if ("game" in $$props) $$invalidate(1, game = $$props.game);
    		if ("keyPressed" in $$props) keyPressed = $$props.keyPressed;
    		if ("interval" in $$props) interval = $$props.interval;
    		if ("move" in $$props) move = $$props.move;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [snake, game];
    }

    class Gameboard$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { snake: 0, game: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gameboard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*snake*/ ctx[0] === undefined && !("snake" in props)) {
    			console.warn("<Gameboard> was created without expected prop 'snake'");
    		}

    		if (/*game*/ ctx[1] === undefined && !("game" in props)) {
    			console.warn("<Gameboard> was created without expected prop 'game'");
    		}
    	}

    	get snake() {
    		throw new Error("<Gameboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snake(value) {
    		throw new Error("<Gameboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get game() {
    		throw new Error("<Gameboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Gameboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.26.0 */
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let settings;
    	let t;
    	let div1;
    	let gameboard;
    	let current;

    	settings = new Settings({
    			props: {
    				snake: /*snake*/ ctx[1],
    				game: /*game*/ ctx[0]
    			},
    			$$inline: true
    		});

    	gameboard = new Gameboard$1({
    			props: {
    				snake: /*snake*/ ctx[1],
    				game: /*game*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(settings.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(gameboard.$$.fragment);
    			attr_dev(div0, "id", "settings");
    			attr_dev(div0, "class", "svelte-kjbsnf");
    			add_location(div0, file$2, 34, 2, 618);
    			attr_dev(div1, "id", "gameboard");
    			attr_dev(div1, "class", "svelte-kjbsnf");
    			add_location(div1, file$2, 37, 2, 681);
    			attr_dev(div2, "id", "screen");
    			attr_dev(div2, "class", "svelte-kjbsnf");
    			add_location(div2, file$2, 33, 0, 598);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(settings, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(gameboard, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			transition_in(gameboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			transition_out(gameboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(settings);
    			destroy_component(gameboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let game = new Gameboard(10, 1);
    	let snake = new Snake(game, 0, 0);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Game: Gameboard,
    		Snake,
    		Settings,
    		Gameboard: Gameboard$1,
    		game,
    		snake
    	});

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("snake" in $$props) $$invalidate(1, snake = $$props.snake);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [game, snake];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
