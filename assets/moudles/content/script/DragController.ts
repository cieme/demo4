import { _decorator, Component, director, EventTouch, input, Input, Node, UITransform, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DragController')
export class DragController extends Component {

    @property({type: Node})
    public moveNode: Node;

    private dragFlag: boolean = false;

    private uitransform: UITransform;

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);

        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchCancle, this);

        this.uitransform = this.getComponent(UITransform);

        if( this.moveNode == null ) {
            this.moveNode = this.node;
        }
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);

        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchCancle, this);
    }

    _onTouchStart(event: EventTouch) {
        if( this.uitransform.hitTest(event.getLocation()) ) {
            this.dragFlag = true;
        }
    }

    _onTouchMove(event: EventTouch) {
        if( this.dragFlag ) {
            this.moveNode.position = v3(this.moveNode.position.x + event.getUIDelta().x, this.moveNode.position.y + event.getUIDelta().y, 0);

            director.emit('render_line_refresh');
        }
    }

    _onTouchEnd(event: EventTouch) {
        if( this.dragFlag ) {
            if( this.uitransform.hitTest(event.getLocation()) ) {
                director.emit('render_object_select', this.node);
            }
        }
        this.dragFlag = false;
    }

    _onTouchCancle(event: EventTouch) {
        this.dragFlag = false;
    }

}

