import { Button } from '../editor/button.js';
import Editor from '../editor/editor.js';
import { Key, ToolInterface } from '../editor/tools.js';

export default class ZoomTool implements ToolInterface {
    readonly name = 'Pixel';
    readonly shortcuts = [
        { code: 'Minus', cmd: true, shift: false, repeat: true },
        { code: 'Equal', cmd: true, shift: false, repeat: true },
        { code: 'Digit0', cmd: true, shift: false, repeat: false },
    ];
    private readonly zoomInButton = new Button('Zoom In');
    private readonly zoomOutButton = new Button('Zoom Out');
    private readonly zoomToFitButton = new Button('Fit to Screen');

    private zoomIn(editor: Editor): void {
        this.zoomInButton.flash();
        editor.zoomIn();
    }

    private zoomOut(editor: Editor): void {
        this.zoomOutButton.flash();
        editor.zoomOut();
    }

    private zoomToFit(editor: Editor): void {
        this.zoomToFitButton.flash();
        editor.zoomToFit();
    }

    init(editor: Editor): void {
        editor.addElementToDock(this.zoomInButton.getDiv());
        editor.addElementToDock(this.zoomOutButton.getDiv());
        editor.addElementToDock(this.zoomToFitButton.getDiv());
        this.zoomInButton.addEventListener('pointerdown', () => {
            this.zoomIn(editor);
        });
        this.zoomOutButton.addEventListener('pointerdown', () => {
            this.zoomOut(editor);
        });
        this.zoomToFitButton.addEventListener('pointerdown', () => {
            this.zoomToFit(editor);
        });
    }

    keyDown(key: Key, editor: Editor): boolean {
        switch (key.code) {
            case 'Digit0': {
                this.zoomToFit(editor);
                break;
            }
            case 'Minus': {
                this.zoomOut(editor);
                break;
            }
            case 'Equal': {
                this.zoomIn(editor);
                break;
            }
        }
        return false;
    }
}
