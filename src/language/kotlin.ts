/* eslint-disable @typescript-eslint/ban-ts-comment */

const remap = {
	_ : "Underscore"
};

export const render = (code: ProgrammingLanguage | undefined, tabs: string): unknown => {
	if(code === null) return "null";
	if(code === undefined) return "";
	switch (code._name) {
	case "result":
		return `${tabs}return ${render(code.value, tabs)}`;
	case "declare": {
		const variables = Object.keys(code.variables).map(
			// @ts-ignore
			key => `${tabs}var ${key}: Any? = ${render(code.variables[key], tabs)}`
		).join("\n");
		const body = code.body.map(it => render(it, tabs)).join("\n");
		return `${variables}${variables ? `\n${body}` : body}`;
	}
	case "fallback": {
		return `(${render(code.value, tabs)} ?: ${render(code.fallback, tabs)})`;
	}
	case "get": {
		const rest = code.variable.slice(1).map(it => render(it, tabs)).join(", ");
		// @ts-ignore
		const name = remap[code.variable[0]] ?? code.variable[0];
		return `get(
${tabs}\tlistOf(
${tabs}\t\t${
	typeof name === "string" ? name : render(name, `${tabs}\t\t`)
}${rest ? `,
${tabs}\t\t${rest}` : ""}
${tabs}\t)
${tabs})`;
	}
	case "set":
		return `${tabs}${code.variable.length <= 1 ? `${code.variable[0]} = ` : ""}set(
${tabs}\tlistOf(
${tabs}\t\t${code.variable[0]},
${tabs}\t\t${code.variable.slice(1).map(it => render(it, `${tabs}\t\t\t`)).join(`,\n${tabs}\t\t\t`)}
${tabs}\t),
${tabs}\t${render(code.value, `${tabs}\t`)}
${tabs})`;
	case "not":
		return `not(${render(code.item, tabs)})`;
	case "add":
		return "add(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "sub":
		return "sub(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "mult":
		return "mult(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "div":
		return "div(" + code.items.map(it => render(it, tabs)).join(", ") + ")";
	case "or":
		return code.items.slice(1).reduce(
			(bool, next) => `${bool}.or(${render(next, tabs)
			})`, render(code.items[0], tabs));
	case "and":
		return code.items.slice(1).reduce(
			(bool, next) => `${bool}.and(${render(next, tabs)
			})`, render(code.items[0], tabs));
	case "gt":
		return `gt(${render(code.a, tabs)}, ${render(code.b, tabs)})`;
	case "lt":
		return `lt(${render(code.a, tabs)}, ${render(code.b, tabs)})`;
	case "gte":
		return `gte(${render(code.a, tabs)}, ${render(code.b, tabs)})`;
	case "eq":
		return `(${render(code.a, tabs)} == ${render(code.b, tabs)})`;
	case "condition": {
		const otherwise = code.otherwise ? ` else {
${render(code.otherwise, tabs + "\t")}
${tabs}}` : "";
		return `${tabs}if(hasValue(${render(code.test, tabs)})) {
${render(code.then, tabs + "\t")}
${tabs}}${otherwise}`;
	}
	case "defined": {
		const value = render(code.item, tabs);
		return `(${value} !== null)`;
	}
	case "fun": {
		const body = [
			...code.args.map(it => `${tabs}\t\tval ${it} = get(listOf(args, "${it}"))`),
			render(code.body, `${tabs}\t\t`)
		];
		return `object : ArgumentCallback {
${tabs}\toverride fun invoke(args: Any?): Any? {
${body.join("\n")}
${tabs}\t\treturn state
${tabs}\t}
${tabs}}`;
	}
	case "invoke": {
		const target = render(code.target, `${tabs}\t`);
		const fun = code.fun;
		const args = code.args.map(it => render(it, `${tabs}\t\t`));
		const sideEffect = code.sideEffect;
		return `${sideEffect ? tabs : ""}invoke(
${tabs}\t${target},
${tabs}\t"${fun}",
${tabs}\tlistOf(
${tabs}\t\t${args.join(`,\n${tabs}\t\t`)}
${tabs}\t)
${tabs})`;
	}
	default:
		// @ts-ignore
		if(code instanceof Array) {
			const content = `
${tabs}\t${
	// @ts-ignore
	code.map(it => render(it, `${tabs}\t`)).join(`,\n${tabs}\t`)
}
${tabs}`;
			// @ts-ignore
			return `mutableListOf<Any?>(${code.length ? content : ""})`;
		}
		if(typeof code === "object") {
			const keys = Object.keys(code);
			return keys.length ? `mutableMapOf<String, Any?>(
${tabs}\t${keys.map(key => `"${key}" to ${render(code[key], `${tabs}\t`)}`).join(`,\n\t${tabs}`)}
${tabs})` : "mutableMapOf<String, Any?>()";
		}
		if(typeof code === "number") {
			return `(${code}).toDouble()`;
		}
		return JSON.stringify(code);
	}
};
