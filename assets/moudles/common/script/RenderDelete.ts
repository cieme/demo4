import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
import { RenderStatus } from './RenderStatus';
import { RenderObject } from './RenderObject';
const { ccclass, property } = _decorator;

@ccclass('RenderDelete')
export class RenderDelete extends Component {

    private renderStatus:RenderStatus;

    private renderObject:RenderObject;

    private shiftFlag = false;

    protected onLoad(): void {
        this.renderStatus = this.getComponent(RenderStatus);
        this.renderObject = this.getComponent(RenderObject);
    }

    protected onEnable(): void {
        this.shiftFlag = false;
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    protected onDisable(): void {
        this.shiftFlag = false;
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _onKeyDown(event: EventKeyboard) {
        if( event.keyCode == KeyCode.SHIFT_LEFT || event.keyCode == KeyCode.SHIFT_RIGHT ) {
            if( this.renderStatus == null || !this.renderStatus.isSelect() ) {
                return;
            }
            
            this.shiftFlag = true;
        }
    }

    private _onKeyUp(event: EventKeyboard) {
        if( this.renderStatus == null || !this.renderStatus.isSelect() ) {
            return;
        }

        if( event.keyCode == KeyCode.SHIFT_LEFT || event.keyCode == KeyCode.SHIFT_RIGHT ) {
            this.shiftFlag = false;
        }

        console.error('key up: ', event, KeyCode.DELETE);

        if( event.keyCode == KeyCode.BACKSPACE ) {
            if( !this.shiftFlag ) {
                this.node.removeFromParent();
            } else {
                this.renderObject.rightId = null;
            }

            director.emit('render_line_refresh');
        }
    }
}

