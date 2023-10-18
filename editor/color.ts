export default class Color {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly rgbaData: Uint8ClampedArray;

    constructor(red: number, green: number, blue: number, alpha = 255) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.rgbaData = new Uint8ClampedArray([red, green, blue, alpha]);
    }

    toString(): string {
        return `rgb(${this.red}, ${this.green}, ${this.blue})`;
    }

    toAlphaString(alpha: number): string {
        return `rgb(${this.red}, ${this.green}, ${this.blue}, ${alpha})`;
    }
}
