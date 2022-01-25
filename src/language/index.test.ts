import {
	declare,
	set,
	add,
	code,
	execute,
	render,
	result,
	mult,
	condition,
	gt,
	eq,
	symbol,
	not,
	sub,
	block,
	fallback
} from "./";

describe("language", () => {
	it("works with object assign", () => {
		const dependencies = new Set([]);
		const background = "white";
		const output = code<{
			component: {
				background : string | null
			}
		}>(({ component }) => set(component.background, background), dependencies);
		expect(render(output, "")).toMatchSnapshot();
		const scope = {
			component: {
				background : null
			},
		};
		expect(scope.component.background).toEqual(null);
		execute(output, scope);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		expect(scope.component.background).toEqual(background);
	});
	it("basic setup works", () => {
		const dependencies = new Set([]);
		const output = code(({ Math, console }) =>
			declare(
				({ a, b }) => [
					set(a, 1.1),
					set(b, 2.9),
					console.log("test", add(Math.round(a), Math.floor(b)))
				],
				{
					a: 0,
					b: 0
				}
			), dependencies
		);
		expect(Array.from(dependencies).sort()).toEqual(["Math", "Math.floor", "Math.round", "console", "console.log"]);
		const round = jest.spyOn(Math, "round");
		const floor = jest.spyOn(Math, "floor");
		const log = jest.fn(() => {
			// DO NOTHING
		});

		execute(output, {
			console: {
				...console,
				log
			}
		});

		expect(round).toBeCalledWith(1.1);
		expect(round).toBeCalledTimes(1);

		expect(floor).toBeCalledWith(2.9);
		expect(floor).toBeCalledTimes(1);

		expect(log).toBeCalledWith("test", 3);
		expect(log).toBeCalledTimes(1);

		expect(render(output, "")).toMatchSnapshot();
	});
	it("supports functions as arguments", () => {
		const dependencies = new Set([]);
		const output = code<{
			state: {
				numbers: number[]
			}
		}>(({ _, state }) =>
			_.map(state.numbers, ({
				item
			}) =>
				result(mult(item, 2))
			), dependencies
		);
		expect(Array.from(dependencies).sort()).toEqual(["_", "_.map", "state", "state.numbers"]);
		expect(render(output, "")).toMatchSnapshot();
		expect(execute(output, {
			state: {
				numbers: [0, 1, 2, 3, 4, 5]
			}
		})).toEqual([0, 2, 4, 6, 8, 10]);
	});
	it("supports conditions", () => {
		const dependencies = new Set([]);
		const output = code<{
			state: {
				a: number,
				b: number
			}
		}>(({
			console,
			state: {
				a,
				b
			}
		}) => condition(gt(a, b), block([
			console.log("a is bigger than b")
		])).otherwise(block([
			console.log("b is bigger than a")
		])), dependencies);
		expect(Array.from(dependencies).sort()).toEqual(["console", "console.log", "state", "state.a", "state.b"]);
		expect(render(output, "")).toMatchSnapshot();
		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			state: {
				a: 10,
				b: 20
			},
			console: {
				...console,
				log
			}
		});
		expect(log).toBeCalledTimes(1);
		expect(log).toBeCalledWith("b is bigger than a");
		execute(output, {
			state: {
				a: 20,
				b: 10
			},
			console: {
				...console,
				log
			}
		});
		expect(log).toBeCalledTimes(2);
		expect(log).toBeCalledWith("a is bigger than b");
	});
	it("support modified chaining", () => {
		const dependencies = new Set([]);
		const output = code<{
			state: {
				data: {
					key: string,
					content: string
				}[]
			}
		}>(({ Date, Math }) =>
			declare(({
				number,
				key
			}) => [
				set(number, Math.random()),
				set(key, number.toString(16)),
				set(number, Date.now()),
				set(key, add("_", key.substr(2), number.toString(16)))
			], {
				number: 0,
				key: ""
			})
		, dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("works for deeply nested conditions", () => {
		const dependencies = new Set([]);
		const output = code<{
			state: {
				data: {
					key: string
					content: string
				}[]
			},
			local: {
				key: string
			}
			event: {
				value: string
			}
		}>(({
			state,
			event,
			local,
			_
		}) => set(state.data, _.map(state.data, ({
			item
		}) =>
			condition(eq(item.key, local.key),
				result({
					key: item.key,
					content: event.value
				})
			).otherwise(
				result(item)
			)
		)), dependencies);
		expect(render(output, "")).toMatchSnapshot();
		const scope = {
			state: {
				data: [{
					key: "a",
					content: "a's content"
				}, {
					key: "b",
					content: "b's content"
				}]
			},
			local: {
				key: "a",
				content: "a's content"
			},
			event: {
				value: "a's new content"
			}
		};
		execute(output, scope);
		expect(scope.state.data).toEqual([{
			key: "a",
			content: "a's new content"
		}, {
			key: "b",
			content: "b's content"
		}]);
	});
	it("allows indexing of variables and numbers", () => {
		const depenencies = new Set([]);
		const output = code<{
			state: {
				data: string[],
				index: number
			}
		}>(({
			state,
			console
		}) => block([
			console.log(symbol(state.data, 1)),
			console.log(symbol(state.data, state.index)),
			set(symbol(state.data, 0), "-a"),
			set(symbol(state.data, state.index), "-c")
		]), depenencies);
		expect(render(output, "")).toMatchSnapshot();
		const log = jest.fn(() => {
			// DO NOTHING
		});
		const scope = {
			state: {
				index: 2,
				data: ["a", "b", "c"]
			},
			console: {
				log
			}
		};
		execute(output, scope);
		expect(log).toBeCalledTimes(2);
		expect(log).not.toBeCalledWith("a");
		expect(log).toBeCalledWith("b");
		expect(log).toBeCalledWith("c");
		expect(scope.state.data).toEqual(["-a", "b", "-c"]);
	});
	it("chains on symbol", () => {
		const dependencies = new Set([]);
		const output = code<{
			state: {
				data : {
					content: string
				}[],
				index: number
			}
		}>(({
			console,
			state
		}) => block([
			console.log(symbol(state.data, 0).content),
			console.log(symbol(state.data, state.index).content)
		]), dependencies);
		expect(render(output, "")).toMatchSnapshot();
		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			state: {
				data: [{
					content: "a"
				}, {
					content: "b"
				}, {
					content: "c"
				}],
				index: 1
			},
			console: {
				log
			}
		});
		expect(log).toBeCalledTimes(2);
		expect(log).toBeCalledWith("a");
		expect(log).toBeCalledWith("b");
		expect(log).not.toBeCalledWith("c");
	});
	it("chains functions", () => {
		const dependencies = new Set([]);
		const output = code(({
			Math,
			Date
		}) => block([
			add("_", Math.random().toString(16).substr(2), Date.now().toString(16))
		]), dependencies);
		expect(render(output, "")).toMatchSnapshot();
		expect(execute(output, {
			Math: {
				random: () => 0.5
			},
			Date: {
				now: () => 0
			}
		})).toEqual("_80");
	});
	it("generates code for explicit setter", () => {
		const dependencies = new Set([]);
		const output = code<{
			state: {
				value: string
				holder: string
			},
		}>(({
			state
		}) => set(state.holder, state.value), dependencies);
		expect(render(output, "")).toMatchSnapshot();
		const scope = {
			state: {
				value: "Hello World",
				holder: "Goodbye cruel world"
			}
		};
		execute(output, scope);
		expect(scope.state.holder).toEqual("Hello World");
	});
	it("allows just true", () => {
		const dependencies = new Set([]);
		const output = code(() => result(true), dependencies);
		expect(render(output, "")).toMatchSnapshot();
		expect(execute(output, {})).toBe(true);
	});
	it("supports complicated setups", () => {
		const dependencies = new Set([]);
		const output = code(({
			state,
			_,
			navigation,
			Date,
			Math
		}) => {
			return condition(not(eq(state.add_list, "")), block([
				declare((variables) => [
					set(variables.key, add("_", Date.now().toString(16), Math.random().toString(16).substr(2))),
					set(variables.route, symbol(state.routes, sub(state.routes?.length ?? 0, 2)).adapter ?? ""),
					condition(eq(variables.route, "list"),
						set(state.list, variables.key)
					),
					condition(eq(variables.route, "task"),
						set(state.task.list, variables.key)
					),
					set(state.lists, _.concat(state.lists, [{
						name: state.add_list,
						key: variables.key
					}]))
				], {
					route: "",
					key: ""
				}),
				navigation.pop()
			]));
		}, dependencies, {
			navigation: {
				pop: () => {
					// DO NOTHINg
				}
			},
			state: {
				list: "",
				add_list: "",
				lists: [{
					name: "",
					key: ""
				}],
				task: {
					list: ""
				},
				routes: [{
					adapter: ""
				}]
			}
		});
		expect(render(output, "")).toMatchSnapshot();
	});
	it("supports timeout", () => {
		const dependencies = new Set([]);
		const output = code(({
			setTimeout,
			console
		}) => setTimeout(() => block([
			console.log("test")
		]), 300), dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("supports declares with code", () => {
		const dependencies = new Set([]);
		const output = code<{
			local: {
				list: string
			},
			component: {
				visible: boolean
				text: string
			},
			state: {
				lists: []
			}
		}>(({
			local,
			component,
			_,
			state
		}) => {
			return declare((variables) => [
				condition(not(eq(local.list, "")), block([
					set(component.visible, true),
					set(component.text, variables.list.name)
				])).otherwise(
					set(component.visible, false)
				)
			], {
				list: _.find<{
					key: string
					name: string
				}>(state.lists, ({ item }) =>
					result(eq(item.key, local.list))
				, {
					key: "",
					name: ""
				})
			});
		}, dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("passes functions to objects", () => {
		const dependencies = new Set([]);
		const output = code(({
			console
		}) => console.log({
			callback: () => block([
				console.log("HERE")
			])
		}), dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("allows renames of declare", () => {
		const dependencies = new Set([]);
		const output = code(({ console }) => declare(({ a }) => [
			declare(({ b }) => [
				console.log(b)
			], {
				b: a
			})
		]	, {
			a: 0
		}), dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("allows renames of functions", () => {
		const dependencies = new Set([]);
		const output = code(({ _, console }) => _.map([], ({ item }) =>
			declare(({
				string
			}) => [
				console.log(string)
			], {
				string: item
			})
		), dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("can get length from a chain", () => {
		const dependencies = new Set([]);
		const output = code(({ _, console }) => declare(({
			length
		}) => [
			console.log(length)
		], {
			length: _.filter([true, false], ({ item }) =>
				result(item)
			).length
		}), dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("handles - in property names", () => {
		const dependencies = new Set([]);
		const output = code(({ console }) => console.log({
			"a-b": "a-b",
			a: "a"
		}), dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("handles functions", () => {
		const dependencies = new Set([]);
		const output = code<{
			needle: number,
			list: number[]
		}>(({
			console,
			_,
			needle,
			list
		}) => declare(({
			list,
			needle
		}) => [console.log(_.some(list, ({
			item
		}) =>
			result(eq(item, needle))
		))], {
			needle,
			list
		}
		), dependencies);
		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			needle: 0,
			list: [0],
			console: {
				log
			}
		});
		expect(log).toBeCalledWith(true);
		expect(log).toBeCalledTimes(1);
	});
	it("can pass arrays as args", () => {
		const dependencies = new Set([]);
		const output = code(({
			console
		}) => console.log([1, 2, 3])
		, dependencies);
		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			console: {
				log
			}
		});
		expect(log).toBeCalledWith([1, 2, 3]);
		expect(log).toBeCalledTimes(1);
	});
	it("fallback can be a symbol target", () => {
		const dependencies = new Set([]);
		const output = code<{
			object: Record<string, string> | null
		}>(({
			object,
			console
		}) => console.log(symbol(fallback(object, {}), "a"))
		, dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("fallback is chainable", () => {
		const dependencies = new Set([]);
		const output = code<{
			object: Record<string, string> | null
		}>(({
			object,
			console
		}) => console.log(fallback(object, {}).a)
		, dependencies);
		expect(render(output, "")).toMatchSnapshot();
	});
	it("conditionally sets", () => {
		const dependencies = new Set([]);
		const output = code<unknown>(({
			console
		}) => declare(({
			value
		}) => [
			condition(true, block([
				set(
					value,
					"test"
				)
			])),
			console.log(value)
		], {
			value: ""
		}), dependencies);

		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			console: {
				...console,
				log
			}
		});
		expect(log).toBeCalledWith("test");
		expect(log).toBeCalledTimes(1);
	});
	it("does not fallback", () => {
		const dependencies = new Set([]);
		const output = code<unknown>(({
			console
		}) => block([
			console.log(fallback("success", "error"))
		]), dependencies);

		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			console: {
				...console,
				log
			}
		});
		expect(log).toBeCalledWith("success");
		expect(log).toBeCalledTimes(1);
	});
	it("does fallback", () => {
		const dependencies = new Set([]);
		const output = code<unknown>(({
			console
		}) => block([
			console.log(fallback(null, "success"))
		]), dependencies);

		const log = jest.fn(() => {
			// DO NOTHING
		});
		execute(output, {
			console: {
				...console,
				log
			}
		});
		expect(log).toBeCalledWith("success");
		expect(log).toBeCalledTimes(1);
	});
	it("can set a string", () => {
		const dependencies = new Set([]);
		const output = code<{
			ref : {
				value : string
			}
		}>(({
			ref
		}) => block([
			set(ref.value, "value")
		]), dependencies);
		const scope = {
			ref : {
				value : null
			}
		}
		expect(render(output, "")).toMatchSnapshot()
		execute(output, scope)
		expect(scope.ref.value).toBe("value")
	})

});