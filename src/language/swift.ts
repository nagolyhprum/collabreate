/* eslint-disable @typescript-eslint/ban-ts-comment */

const remap = {
	_ : "PollyUnderscore",
	Date: "PollyDate",
	Math: "PollyMath"
};

export const render = (code: ProgrammingLanguage | undefined, tabs: string): unknown => {
	if(code === null) return "nil";
	if(code === undefined) return "PollyGlobal";
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
		return `${render(code.value, tabs)} ?? ${render(code.fallback, tabs)}`;
	}
	case "get": {
		const rest = code.variable.slice(1).map(it => render(it, tabs)).join(", ");
		// @ts-ignore
		const name = remap[code.variable[0]] ?? code.variable[0];
		return `get(
${tabs}\troot : ${typeof name === "string" ? name : render(name, `${tabs}\t\t`)},
${tabs}\tpath : [${rest ? `\n${tabs}\t\t${rest}\n${tabs}\t` : ""}]
${tabs})`;
	}
	case "set":
		return `${tabs}${code.variable[0]} = set(
${tabs}\troot : ${code.variable[0]},
${tabs}\tpath : [
${tabs}\t\t${code.variable.slice(1).map(it => render(it, `${tabs}\t\t\t`)).join(`,\n${tabs}\t\t\t`)}
${tabs}\t],
${tabs}\tvalue: ${render(code.value, `${tabs}\t`)}
${tabs})`;
	case "not":
		return `not(input : ${render(code.item, tabs)})`;
	case "add":
		return "add(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "sub":
		return "sub(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "mult":
		return "mult(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "div":
		return "div(input : [" + code.items.map(it => render(it, tabs)).join(", ") + "])";
	case "or":
		return "(" + code.items.map(it => render(it, tabs)).join(" || ") + ")";
	case "and":
		return "(" + code.items.map(it => render(it, tabs)).join(" && ") + ")";
	case "gt":
		return `gt(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "lt":
		return `lt(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "gte":
		return `gte(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "eq":
		return `equals(a : ${render(code.a, tabs)}, b : ${render(code.b, tabs)})`;
	case "condition": {
		const otherwise = code.otherwise ? ` else {
${render(code.otherwise, tabs + "\t")}
${tabs}}` : "";
		return `${tabs}if(hasValue(input : ${render(code.test, tabs)})) {
${render(code.then, tabs + "\t")}
${tabs}}${otherwise}`;
	}
	case "defined": {
		const value = render(code.item, tabs);
		return `hasValue(input : ${value})`;
	}
	case "fun": {
		const body = [
			...code.args.map(it => `${tabs}\tvar ${it} = get(root : args, path : ["${it}"])`),
			render(code.body, `${tabs}\t`)
		];
		return `{ (args : Any?) -> Any? in
${body.join("\n")}
${tabs}\treturn state
${tabs}}`;
	}
	case "invoke": {
		const target = render(code.target, `${tabs}\t`);
		const fun = code.fun;
		const args = code.args.map(it => render(it, `${tabs}\t\t`));
		const sideEffect = code.sideEffect;
		return `${sideEffect ? tabs : ""}invoke(
${tabs}\ttarget : ${target},
${tabs}\tname : "${fun}",
${tabs}\targs : [
${tabs}\t\t${args.join(`,\n${tabs}\t\t`)}
${tabs}\t]
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
			return `[${code.length ? content : ""}]`;
		}
		if(typeof code === "object") {
			const keys = Object.keys(code);
			return keys.length ? `[
${tabs}\t${keys.map(key => `"${key}" : ${render(code[key], `${tabs}\t`)}`).join(`,\n\t${tabs}`)}
${tabs}]` : "[:]";
		}
		if(typeof code === "number") {
			return `Double(${code})`;
		}
		return JSON.stringify(code);
	}
};
