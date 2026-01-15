import { describe, it, expect } from "vitest";
import { Engine } from "../src/Engine";

describe("dot.frame Engine", () => {
	const engine = new Engine(100, 100, 10);

	it("calculates white as max luminance", () => {
		expect(engine.calculateLuminance(255, 255, 255)).toBe(255);
	});

	it("calculates black as min luminance", () => {
		expect(engine.calculateLuminance(0, 0, 0)).toBe(0);
	});

	it("maps luminance to the correct dot symbol", () => {
		expect(engine.mapToSymbol(255)).toBe("@");
		expect(engine.mapToSymbol(0)).toBe(" ");
	});
});
