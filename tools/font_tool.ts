import Editor from '../editor/editor.js';
import {
    ChangeMode,
    ToolInterface,
    black,
    gray,
    white,
} from '../editor/tools.js';
import { Encoding, EncodingButton, ToggleButton } from '../editor/button.js';
import { Window, WindowInterface } from '../editor/window.js';
import Coord from '../editor/coord.js';
import ascii from '../encodings/ascii.js';
import iso8859_1 from '../encodings/iso8859_1.js';
import windows1252 from '../encodings/windows1252.js';

class FontWindow implements WindowInterface {
    private readonly window = new Window(this);
    private readonly button: ToggleButton;
    private readonly div = document.createElement('div');
    private readonly canvas = document.createElement('canvas');
    private readonly selectedDiv = document.createElement('div');
    private readonly canvases = new Array<HTMLCanvasElement>();

    constructor(button: ToggleButton) {
        this.button = button;
        this.div.style.position = 'relative';
        this.div.style.backgroundColor = 'red';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.imageRendering = 'pixelated';
        this.div.appendChild(this.canvas);
        this.window.addElement(this.div);
        this.selectedDiv.style.position = 'absolute';
        this.selectedDiv.style.border = `1px solid ${white.toString()}`;
        this.selectedDiv.style.borderRadius = '2px';
        this.div.appendChild(this.selectedDiv);
        for (let i = 0; i < 256; i++) {
            const canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.imageRendering = 'pixelated';
            canvas.style.pointerEvents = 'none';
            this.canvases.push(canvas);
            this.div.appendChild(canvas);
        }
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    addTo(div: HTMLDivElement): void {
        this.window.addTo(div);
    }

    resetPosition(): void {
        this.window.resetPosition();
    }

    close(): void {
        this.window.remove();
        this.button.setToggle(false);
    }

    redraw(editor: Editor, scale = 3): void {
        const width = (editor.width * 16 + 16) * scale;
        const height = (editor.height * 16 + 16) * scale;
        this.div.style.width = `${width}px`;
        this.div.style.height = `${height}px`;
        this.canvas.height = height;
        this.canvas.width = width;
        const ctx = this.canvas.getContext('2d');
        if (ctx != null) {
            ctx.fillStyle = black.toString();
            ctx.fillRect(0, 0, width, height);
            const imageDataHorizontal = ctx.createImageData(width, 1);
            for (let i = 0; i < width * 4; i += 4) {
                if (i % 8 == 0) {
                    imageDataHorizontal.data.set(gray.rgbaData, i);
                } else {
                    imageDataHorizontal.data.set(black.rgbaData, i);
                }
            }
            for (
                let y = (editor.height + 1) * scale;
                y < height;
                y += (editor.height + 1) * scale
            ) {
                ctx.putImageData(imageDataHorizontal, 0, y);
            }
            const imageDataVertical = ctx.createImageData(1, height);
            for (let i = 0; i < width * 4; i += 4) {
                if (i % 8 == 0) {
                    imageDataVertical.data.set(gray.rgbaData, i);
                } else {
                    imageDataVertical.data.set(black.rgbaData, i);
                }
            }
            for (
                let x = (editor.width + 1) * scale;
                x < width;
                x += (editor.width + 1) * scale
            ) {
                ctx.putImageData(imageDataVertical, x, 0);
            }
            ctx.font = '18px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = gray.toString();
            let code = 0;
            for (let y = 0; y < 16; y += 1) {
                for (let x = 0; x < 16; x += 1) {
                    if (code > 32 && code < 127) {
                        const px =
                            Math.floor((x + 0.5) * editor.width * scale) +
                            x * scale;
                        const py =
                            Math.floor((y + 0.5) * editor.height * scale) +
                            y * scale +
                            2;
                        const char = String.fromCharCode(code);
                        ctx.fillText(char, px, py);
                    }
                    const canvas = this.canvases[code]!;
                    canvas.width = editor.width;
                    canvas.height = editor.height;
                    canvas.style.width = `${editor.width * scale}px`;
                    canvas.style.height = `${editor.height * scale}px`;
                    canvas.style.left = `${
                        (x * (editor.width + 1) + 1) * scale
                    }px`;
                    canvas.style.top = `${
                        (y * (editor.height + 1) + 1) * scale
                    }px`;
                    code += 1;
                }
            }
        }
    }

    resize(editor: Editor): void {
        this.redraw(editor);
    }

    change(editor: Editor): void {
        const canvas = this.canvases[editor.getCode()]!;
        if (editor.hasAnyPixels()) {
            canvas.style.opacity = '1';
            const ctx = canvas.getContext('2d')!;
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            imageData.data.set(editor.getRgbaData());
            ctx.putImageData(imageData, 0, 0);
        } else {
            canvas.style.opacity = '0';
        }
    }

    setCode(code: number, editor: Editor, scale = 3): void {
        const x = code % 16;
        const y = Math.floor(code / 16);
        const px = x * (editor.width + 1) * scale;
        const py = y * (editor.height + 1) * scale;
        this.selectedDiv.style.left = `${px}px`;
        this.selectedDiv.style.top = `${py}px`;
        this.selectedDiv.style.width = `${(editor.width + 1) * scale}px`;
        this.selectedDiv.style.height = `${(editor.height + 1) * scale}px`;
    }
}

export default class FontTool implements ToolInterface {
    name = 'Font';
    private readonly button = new ToggleButton('Font');
    private readonly encodingButton = new EncodingButton(Encoding.Ascii);
    private readonly window = new FontWindow(this.button);

    init(editor: Editor): void {
        this.button.addEventListener('pointerdown', () => {
            const toggled = this.button.getToggle();
            if (toggled) {
                this.window.close();
                this.button.setToggle(false);
            } else {
                editor.addWindow(this.window);
                this.button.setToggle(true);
            }
        });
        editor.addElementToDock(this.button.getDiv());
        editor.addElementToDock(this.encodingButton.getDiv());
        this.encodingButton.addEventListener('pointerdown', () => {
            this.encodingButton.flash();
            this.encodingButton.toggle();
            this.setName(editor.getCode(), editor);
        });
        this.window.redraw(editor);
        const canvas = this.window.getCanvas();
        canvas.addEventListener('pointerdown', (event) => {
            const rect = canvas.getBoundingClientRect();
            const fontWidth = rect.width / 16;
            const fontHeight = rect.height / 16;
            const x = Math.floor((event.clientX - rect.left) / fontWidth);
            const y = Math.floor((event.clientY - rect.top) / fontHeight);
            editor.setCode(x + y * 16);
        });
    }

    setName(code: number, editor: Editor): void {
        const encoding = this.encodingButton.getEncoding();
        switch (encoding) {
            case Encoding.Ascii:
                editor.setHeader(ascii[code]);
                break;
            case Encoding.Iso8859_1:
                editor.setHeader(iso8859_1[code]);
                break;
            case Encoding.Windows1252:
                editor.setHeader(windows1252[code]);
                break;
        }
    }

    setCode(code: number, editor: Editor): void {
        this.window.setCode(code, editor);
        this.setName(code, editor);
    }

    change(_coord: Coord, _from: boolean, editor: Editor): void {
        if (this.button.getToggle()) {
            this.window.change(editor);
        }
    }

    allChange(_from: boolean[], _mode: ChangeMode, editor: Editor): void {
        if (this.button.getToggle()) {
            this.window.change(editor);
        }
    }
}
