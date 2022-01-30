/* eslint-disable @typescript-eslint/ban-ts-comment */

const wrapResult = (result: unknown): unknown => {
	if(typeof result === "string") {
		return new String(result);
	}
	if(typeof result === "number") {
		return new Number(result);
	}
	if(typeof result === "boolean") {
		return new Boolean(result);
	}
	if(result === undefined || result === null) {
		return {};
	}
	return result;
};

export const invoke = ({
	fun,
	args,
	target,
	sideEffect
} : {
	fun: string | symbol
	args: unknown[]
	target: unknown
	sideEffect: boolean
}) => ({
	_name: "invoke",
	target,
	fun,
	args: args.map(useCode),
	sideEffect
});

export const proxy = ({
	scope,
	path,
	dependencies
}: {
	scope: any,
	path: unknown[],
	dependencies: Set<string>
}): any =>
	new Proxy(
		{},
		{
			set() {
				throw new Error("cannot set values this way");
			},
			get(_, key: string | symbol) {
				if (key === "_code") {
					return scope?._code ?? {
						_name: "get",
						variable: path
					};
				}
				const prop = scope[key] ?? {};
				const codePath = scope._code;
				const nextPath = [...path, ...(codePath ? [codePath] : []), useCode(key)];
				if(nextPath.every(it => ["string", "number"].includes(typeof it))) {
					dependencies.add(nextPath.join("."));
				}
				if (typeof prop === "function") {
					return (...args: unknown[]) => {
						const result = prop.call(scope);
						const wrapped = wrapResult(result) as {
							_code: unknown
						};
						wrapped._code = invoke({
							target: scope._code ?? {
								_name: "get",
								variable: path
							},
							fun: key,
							args: args.map(useCode),
							sideEffect: result === undefined
						});
						return proxy({
							dependencies: new Set([]),
							path: [],
							scope: wrapped
						});
					};
				}
				return proxy({
					scope: wrapResult(prop),
					path: nextPath,
					dependencies
				});
			}
		}
	);


const useCode = (it: unknown): any => {
	if(it === undefined || it === null) {
		return null;
	}
	// @ts-ignore
	const code = it._code;
	if(code) {
		// @ts-ignore
		return code;
	}
	if(it instanceof Array) {
		return it.map(useCode);
	}
	// @ts-ignore
	if(typeof it === "object" && !it._name) {
		// @ts-ignore
		Object.keys(it).forEach(key => {
			// @ts-ignore
			it[key] = useCode(it[key]);
		});
	}
	if(typeof it === "function") {
		const scope = {};
		const dependencies = new Set<string>([]);
		const body = it(proxy({
			scope,
			path: [],
			dependencies
		}));
		return {
			_name: "fun",
			args: Array.from(dependencies).filter(it => !it.includes(".")),
			body: useCode(body)
		};
	}
	return it;
};

export const condition = (test: boolean, then: ProgrammingLanguage): ProgrammingLanguage & {
	otherwise: (otherwise: ProgrammingLanguage) => ProgrammingLanguage
} => {
	return {
		// @ts-ignore
		_code: {
			_name: "condition",
			test: useCode(test),
			then: useCode(then)
		},
		otherwise: (otherwise: ProgrammingLanguage) => ({
			_code: {
				_name: "condition",
				test: useCode(test),
				then: useCode(then),
				otherwise: useCode(otherwise)
			}
		}) as unknown as ProgrammingLanguage
	};
};

export const PollyDate: PollyDate = {
	now: Date.now
};

export const code = <T = unknown>(callback: (scope: {
	Math: Math,
	console: Console
	Date: PollyDate,
	setTimeout: PollyTimeout,
	JSON: PollyJSON
	_: UnderscoreProgramming
	fetch: FetchProgramming
} & T) => unknown, dependencies: Set<string>, scope?: T): ProgrammingLanguage => {
	return useCode(callback(
		proxy({
			scope: {
				JSON: {
					stringify: () => "",
					parse: () => ({})
				},
				fetch: () => {
					// DO NOTHING
				},
				Math,
				Date: PollyDate,
				console: {
					log: () => {
						// DO NOTHING
					}
				},
				setTimeout: () => 0,
				parseFloat: () => 0,
				socket : {
					on : () => {
						// DO NOTHING
					}
				},
				_: {
					toLowerCase: () => "",
					split: () => [],
					toString: () => "",
					some: () => false,
					every: () => false,
					indexOf: () => -1,
					compare: () => 0,
					sort: () => [],
					map: ()  => [],
					forEach: ()  => {
						// DO NOTHING
					},
					reduce: (items: any, callback: any, initial: any) => initial || {},
					slice: () => [],
					replace: () => "",
					filter: ()  => [],
					includes: () => false,
					concat: () => [],
					assign: () => ({}),
					find: () => ({}),
					upsert: () => []
				},
				...scope
			},
			path: [],
			dependencies
		})
	));
};

class Result {
	constructor(
		public value: unknown
	) {

	}
}


export function symbol<T>(variable : T[], index: number): T;
export function symbol<
	K extends string | number | symbol,
	V
>(variable : Record<K, V>, index: K): V;
export function symbol(
	variable: any,
	index: any
): any {
	const path = useCode(variable);
	const dependencies = new Set([]);
	// TODO make this better
	if(path._name === "fallback") {
		return proxy({
			scope: {},
			dependencies,
			path: [path, useCode(index)]
		});
	} else {
		return proxy({
			scope: {},
			dependencies,
			path: [...path.variable, useCode(index)]
		});
	}
}

export const add = <T extends string | number>(...items: T[]): T extends string ? string : number => {
	// @ts-ignore
	return {
		_name: "add",
		items: items.map(useCode)
	};
};

export const or = <T>(...items: T[]): T => {
	// @ts-ignore
	return {
		_name: "or",
		items: items.map(useCode)
	};
};

export const and = <T>(...items: T[]): T => {
	// @ts-ignore
	return {
		_name: "and",
		items: items.map(useCode)
	};
};

export const sub = <T>(...items: T[]): number => {
	// @ts-ignore
	return {
		_name: "sub",
		items: items.map(useCode)
	};
};

export const not = (item: boolean): boolean => {
	// @ts-ignore
	return {
		_name: "not",
		item: useCode(item)
	};
};

export const defined = (item: unknown): boolean => {
	// @ts-ignore
	return {
		_name: "defined",
		item: useCode(item)
	};
};

export const mult = <T>(...items: T[]): number => {
	// @ts-ignore
	return {
		_name: "mult",
		items: items.map(useCode)
	};
};

export const div = <T>(...items: T[]): number => {
	// @ts-ignore
	return {
		_name: "div",
		items: items.map(useCode)
	};
};

export const gte = (a: number, b: number): boolean => {
	// @ts-ignore
	return {
		_name: "gte",
		a: useCode(a),
		b: useCode(b)
	};
};

export const gt = (a: number, b: number): boolean => {
	// @ts-ignore
	return {
		_name: "gt",
		a: useCode(a),
		b: useCode(b)
	};
};

export const lt = (a: number, b: number): boolean => {
	// @ts-ignore
	return {
		_name: "lt",
		a: useCode(a),
		b: useCode(b)
	};
};

export const eq = <T>(a: T, b: T): boolean => {
	// @ts-ignore
	return {
		_name: "eq",
		a: useCode(a),
		b: useCode(b)
	};
};

export const fallback = <T>(value: T | null | undefined, fallback: T): T => {
	// @ts-ignore
	return proxy({
		scope: {},
		dependencies: new Set([]),
		path: [{
			_name: "fallback",
			value: useCode(value),
			fallback: useCode(fallback)
		}]
	});
};

export const result = (input?: unknown): ProgrammingLanguage => {
	return {
		_name: "result",
		value: useCode(input)
	};
};

export const set = <T>(variable: T, value: T): ProgrammingLanguage => {
	// @ts-ignore
	const code = variable._code;
	return {
		_name: "set",
		// @ts-ignore
		variable: code ? code.variable : (variable.variable ?? variable),
		value: useCode(value)
	};
};

export const declare = <T extends {
	[key: string]: unknown
}>(callback: (input: T) => unknown[], variables: T): ProgrammingLanguage => {
	const scope = Object.keys(variables).reduce((variables, key) => {
		// @ts-ignore
		variables[key] = useCode(variables[key]);
		return variables;
	}, variables);
	const body = callback(
		proxy({
			scope,
			path: [],
			dependencies: new Set([])
		})
	);
	return {
		_name: "declare",
		variables: scope,
		body: body.map(useCode)
	};
};

export const block = (input: unknown[]): ProgrammingLanguage => declare(() => input, {});

const getFromScope = (name: (string | number | symbol)[], scope: any, prop : string) => {
	if (name.length === 0) {
		for(let i = scope.length - 1; i >= 0; i--) {
			if(prop in scope[i]) {
				return scope[i];
			}
		}
		return scope[0];
	}
	for (let i = scope.length - 1; i >= 0; i--) {
		// @ts-ignore
		if (name[0] in scope[i]) {
			let value = scope[i][name[0]];
			for (let j = 1; j < name.length; j++) {
				if(value != null && value !== undefined) {
					value = value[name[j]];
				}
			}
			return value;
		}
	}
};

export const execute = <T>(
	code: ProgrammingLanguage,
	scope: T
): unknown => {
	const result = executeWithScope(
		code,
		[
			{
				JSON,
				Math,
				console,
				Date: PollyDate,
				encodeURIComponent,
				parseFloat,
				socket : {
					on : () => {
						// DO NOTHING
					}
				},
				_: {
					toLowerCase: (input : string) => input.toLowerCase(),
					split: (input : string, token : string) => input.split(new RegExp(token)) ,
					concat: <T>(...items: T[][]) : T[] => {
						return items.reduce((total, list) => list ? [...total, ...list] : total, [] as T[]);
					},
					toString: (input : unknown) => `${input}`,
					slice: <T>(items : T[], from : number, to : number): T[] => {
						if(!items) {
							return [];
						}
						return items.slice(from, to);
					},
					replace: (haystack: string, needle: string, replace: string) => {
						if(!haystack) {
							return "";
						}
						return haystack.replace(new RegExp(needle, "g"), replace);
					},
					reduce: <T, U>(items: T[], callback: (args: {
						item: T,
						total: U
						index: number
					}) => U, initial: U): U => {
						if(!items) {
							return initial;
						}
						return items.reduce((total, item, index) => {
							return callback({
								item,
								total,
								index
							});
						}, initial);
					},
					map: <T, U>(items: T[], callback: (args: {
						item: T
						index: number
					}) => U): U[] => {
						if(!items) {
							return [];
						}
						return items.map((item, index) => {
							return callback({
								item,
								index
							});
						});
					},
					forEach: <T, U>(items: T[], callback: (args: {
						item: T
						index: number
					}) => U): void => {
						if(!items) {
							return;
						}
						items.forEach((item, index) => {
							return callback({
								item,
								index
							});
						});
					},
					find: <T>(items: T[], callback: (args: {
						item: T
					}) => boolean, or: T): T => {
						if(!items) {
							return or;
						}
						return items.find((item) => {
							return callback({
								item
							});
						}) ?? or;
					},
					filter: <T>(items: T[], callback: (args: {
						item: T
						index: number
					}) => boolean): T[] => {
						if(!items) {
							return [];
						}
						return items.filter((item, index) => {
							return callback({
								item,
								index
							});
						});
					},
					indexOf: <T>(haystack : T[], callback : (item : T) => boolean) => {
						const item = haystack.find(callback);
						return item ? haystack.indexOf(item) : -1;
					},
					some: <T>(items: T[], callback: (args: {
						item: T
					}) => boolean): boolean => {
						if(!items) {
							return false;
						}
						return items.some((item) => {
							return callback({
								item
							});
						});
					},
					every: <T>(items: T[], callback: (args: {
						item: T
					}) => boolean): boolean => {
						if(!items) {
							return false;
						}
						return items.every((item) => {
							return callback({
								item
							});
						});
					},
					assign: (...args : unknown[]) => {
						return args.slice(1).reduce(
							(total, overwrite) => Object.assign(total || {}, overwrite),
							args[0]
						);
					},
					includes: <E>(haystack : E[], needle : E) => {
						return haystack.includes(needle);
					},
					sort : <E>(array : E[], sort : (arg : { a : E, b : E }) => number) => {
						return array.sort((a, b) => {
							return sort({
								a,
								b
							});
						});
					}
				},
				...scope
			}
		]
	);
	if(result instanceof Result) {
		return result.value;
	}
	return result;
};

const executeBody = (body: ProgrammingLanguage[], scope: any[]) => {
	let result;
	for(let i = 0; i < body.length; i++) {
		result = executeWithScope(body[i], scope);
		if(result instanceof Result) {
			return result;
		}
	}
	return result;
};

const executeWithScope = (
	code: ProgrammingLanguage,
	scope: any[]
): any => {
	if(code === undefined || code === null) {
		return code;
	}
	switch (code._name) {
	case "condition": {
		const test = executeWithScope(code.test, scope);
		if(test) {
			return executeWithScope(code.then, [...scope, {}]);
		} else if(code.otherwise) {
			return executeWithScope(code.otherwise, [...scope, {}]);
		}
		return;
	}
	case "declare":
		Object.keys(code.variables).forEach((key) => {
			// @ts-ignore
			scope[scope.length - 1][key] = executeWithScope(code.variables[key], scope);
		});
		return executeBody(code.body, scope);
	case "get":{
		if(code.variable.length === 1 && code.variable[0]._name === "fallback") {
			return executeWithScope(code.variable[0], scope);
		}
		return getFromScope(code.variable.map(it => executeWithScope(it, scope)), scope, "");
	}
	case "defined": {
		const value = executeWithScope(code.item, scope);
		return value !== undefined && value !== null;
	}
	case "set": {
		const target = code.variable.map(it => executeWithScope(it, scope));
		const prop = target.pop();
		const variable = getFromScope(target, scope, prop as unknown as string);
		if(
			variable !== undefined && variable !== null &&
			prop !== undefined && prop !== null
		) {
			const value = executeWithScope(code.value, scope);
			// @ts-ignore
			variable[prop] = value;
		}
		return;
	}
	case "invoke": {
		const target = executeWithScope(code.target, scope);
		const prop = code.fun;
		const args = code.args.map((it) => executeWithScope(it, scope));
		const fun = getFromScope([prop], scope, "");
		if(target === null || target === undefined) {
			if(fun) {
				return fun(...args);
			}
		// @ts-ignore
		} else if(target[prop]) {
			// @ts-ignore
			return target[prop](...args);
		}
		console.warn("unimplemented functionality", target, prop, args);
		return null;
	}
	case "add": {
		const first = executeWithScope(code.items[0], scope) as number;
		return code.items.slice(1).reduce((total, it) => total + (executeWithScope(it, scope) as number), first);
	}
	case "sub": {
		const first = executeWithScope(code.items[0], scope) as number;
		return code.items.slice(1).reduce((total, it) => total - (executeWithScope(it, scope) as number), first);
	}
	case "mult": {
		return code.items.reduce((total, it) => total * (executeWithScope(it, scope) as number), 1);
	}
	case "div": {
		const first = executeWithScope(code.items[0], scope) as number;
		return code.items.slice(1).reduce((total, it) => total / (executeWithScope(it, scope) as number), first);
	}
	case "or": {
		return code.items.reduce((total, it) => total || (executeWithScope(it, scope) as boolean), false);
	}
	case "and": {
		return code.items.reduce((total, it) => total && (executeWithScope(it, scope) as boolean), true);
	}
	case "gt": {
		return (executeWithScope(code.a, scope) as number) > (executeWithScope(code.b, scope) as number);
	}
	case "lt": {
		return (executeWithScope(code.a, scope) as number) < (executeWithScope(code.b, scope) as number);
	}
	case "gte": {
		return (executeWithScope(code.a, scope) as number) >= (executeWithScope(code.b, scope) as number);
	}
	case "eq": {
		return executeWithScope(code.a, scope) === executeWithScope(code.b, scope);
	}
	case "not": {
		return !executeWithScope(code.item, scope);
	}
	case "fun": {
		return (args: any) => {
			const result = executeWithScope(code.body, [...scope, args]);
			if(result instanceof Result) {
				return result.value;
			}
		};
	}
	case "fallback": {
		return executeWithScope(code.value, scope) ?? executeWithScope(code.fallback, scope);
	}
	case "result": {
		return new Result(executeWithScope(code.value, scope));
	}
	default: {
		const data = code as any;
		if(data instanceof Array) {
			return data.map(object => executeWithScope(object, scope));
		}
		if(typeof data === "object") {
			return Object.keys(data).reduce<Record<string, unknown>>((object, key) => {
				object[key] = executeWithScope(data[key], scope);
				return object;
			}, {});
		}
	}
	}
	return code;
};

const renderPath = (path: ProgrammingLanguage[], tabs: string) => {
	return path.map((it, index) => {
		if(typeof it === "string") return `${index ? "." : ""}${it}`;
		return index ? `[${render(it, tabs)}]` : render(it, tabs);
	}).join("");
};

export const render = (code: ProgrammingLanguage | undefined, tabs: string): string => {
	if(code === null) return "null";
	if(code === undefined) return "";
	switch (code._name) {
	case "condition": {
		const otherwise = code.otherwise ? ` else {
${render(code.otherwise, tabs + "\t")}
${tabs}}` : "";
		return `${tabs}if(${render(code.test, tabs)}) {
${render(code.then, tabs + "\t")}
${tabs}}${otherwise}`;
	}
	case "declare": {
		const keys = Object.keys(code.variables);
		const variables = keys.length ? `${tabs}var ${
			keys.map((key) => {
				// @ts-ignore
				return `${key} = ${render(code.variables[key], tabs)}`;
			})
				.join(", ")};\n` : "";
		const body = code.body.map(it => render(it, tabs)).join("\n");
		return `${variables}${body}`;
	}
	case "set":
		return `${tabs}${renderPath(code.variable, tabs)} = ${render(code.value, tabs)};`;
	case "get":
		return renderPath(code.variable, tabs);
	case "invoke": {
		const target = render(code.target, tabs);
		const fun = code.fun;
		const args = code.args.map(it => render(it, tabs));
		const sideEffect = code.sideEffect;
		return `${sideEffect ? tabs : ""}${target}${target ? "." : ""}${fun}(${args.join(", ")})${sideEffect ? ";" : ""}`;
	}
	case "not":
		return `!(${render(code.item, tabs)})`;
	case "add":
		return "(" + code.items.map(it => render(it, tabs)).join(" + ") + ")";
	case "sub":
		return "(" + code.items.map(it => render(it, tabs)).join(" - ") + ")";
	case "mult":
		return "(" + code.items.map(it => render(it, tabs)).join(" * ") + ")";
	case "div":
		return "(" + code.items.map(it => render(it, tabs)).join(" / ") + ")";
	case "or":
		return "(" + code.items.map(it => render(it, tabs)).join(" || ") + ")";
	case "and":
		return "(" + code.items.map(it => render(it, tabs)).join(" && ") + ")";
	case "gt":
		return `(${render(code.a, tabs)} > ${render(code.b, tabs)})`;
	case "lt":
		return `(${render(code.a, tabs)} < ${render(code.b, tabs)})`;
	case "gte":
		return `(${render(code.a, tabs)} >= ${render(code.b, tabs)})`;
	case "eq":
		return `(${render(code.a, tabs)} === ${render(code.b, tabs)})`;
	case "result":
		return `${tabs}return ${render(code.value, tabs)};`;
	case "fun": {
		const body : string[] = [
			...code.args.map(it => `${tabs}\tvar ${it} = args.${it};`),
			render(code.body, `${tabs}\t`)
		];
		return `function (args) {
${body.join("\n")}
${tabs}}`;
	}
	case "defined": {
		const value = render(code.item, "");
		return `${value} !== undefined && ${value} !== null`;
	}
	case "fallback": {
		const value = render(code.value, tabs);
		const fallback = render(code.fallback, tabs);
		return `(${value} === null || ${value} === undefined ? ${fallback} : ${value})`;
	}
	default:
		// @ts-ignore
		if(code instanceof Array) {
			// @ts-ignore
			return `[${code.map(it => render(it, tabs)).join(", ")}]`;
		}
		if(typeof code === "object") {
			const keys = Object.keys(code);
			return keys.length ? `{
${tabs}\t${keys.map(key => `${wrapKey(key)}: ${render(code[key], `${tabs}\t`)}`).join(`,\n\t${tabs}`)}
${tabs}}` : "{}";
		}
		return JSON.stringify(code);
	}
};

const variableRegexp = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

const wrapKey = (input: string) => {
	if(input.match(variableRegexp)) {
		return input;
	}
	return `"${input}"`;
};
