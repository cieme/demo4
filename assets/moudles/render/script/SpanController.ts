import { _decorator, Button, Component, director, EventKeyboard, EventMouse, EventTouch, input, Input, instantiate, KeyCode, Node, Prefab, UIOpacity, v2, v3, Vec2, Vec3 } from 'cc';
import { ContentObject } from '../../content/script/ContentObject';
import { DragController } from '../../content/script/DragController';
import { RenderObject, RenderType } from '../../common/script/RenderObject';
import { RenderStatus } from '../../common/script/RenderStatus';
import { RenderDelete } from '../../common/script/RenderDelete';
const { ccclass, property } = _decorator;

@ccclass('SpanController')
export class SpanController extends Component {

    @property({type: Prefab})
    public objectPrefab: Prefab;
    
    @property({type: Node})
    public item: Node;

    /**
     * 鼠标位置
     */
    private mousePos: Vec2 = v2(-1000, -1000);

    /**
     * 拖拽的节点
     */
    private dragNode: Node;

    onEnable() {
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this._onMouseUp, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchUp, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.off(Input.EventType.MOUSE_UP, this._onMouseUp, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchUp, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    _onMouseMove(event: EventMouse) {
        this.mousePos = event.getUILocation();
        this._flushDragPostion();
    }

    _onMouseUp(event: EventMouse) {
        if( EventMouse.BUTTON_RIGHT == event.getButton() ) {
            if( this.dragNode != null ) {
                this.dragNode.removeFromParent();
            }
            this.dragNode = null;
        }
    }

    _onTouchUp(event: EventTouch) {
        if( this.dragNode != null ) {
            let controller = this.dragNode.getComponent(DragController);
            controller.enabled = true;

            let _opacity = this.dragNode.getComponent(UIOpacity);
            if(_opacity) {
                _opacity.enabled = false;
            }

            this.dragNode.getComponent(RenderStatus).enabled = true;
            this.dragNode.addComponent(RenderDelete);
        }

        this.node.active = false;
        this.dragNode = null;
        director.emit('render_object_unselect');
    }

    _onKeyUp(event: EventKeyboard) {
        if( event.keyCode == KeyCode.ESCAPE ) {
            if( this.dragNode != null ) {
                this.dragNode.removeFromParent();
            }
            this.dragNode = null;
            director.emit('render_object_unselect');
        }
    }

    public buildNode(objectType: string, objectShowName: string) {
        if( this.dragNode != null ) {
            this.dragNode.removeAllChildren();
            this.dragNode = null;
        }

        let uniqueId = Date.now().toString() + (10000 + Math.floor(Math.random() * 99999));
        let _node = this._buildNode(objectType, objectShowName, v3(this.mousePos.x, this.mousePos.y, 0));
        this.dragNode = _node;
        let _opacity = _node.getComponent(UIOpacity);
        if(_opacity) {
            _opacity.enabled = true;
        }

        _node.getComponent(Button).enabled = false;
        let _renderObject = _node.addComponent(RenderObject);
        _renderObject.uniqueId = uniqueId;
        _renderObject.renderType = RenderType.Content;
        _node.getComponent(RenderStatus).enabled = false;

        return _node;
    }

    public buildNodeWithPos(objectType: string, objectShowName: string, position: Vec3, uniqueId:string) {
        if( uniqueId == null  ) {
            uniqueId = Date.now().toString() + (10000 + Math.floor(Math.random() * 99999))
        }
        let _node = this._buildNode(objectType, objectShowName, position);
        let _renderObject = _node.addComponent(RenderObject);
        _renderObject.uniqueId = uniqueId;
        _renderObject.renderType = RenderType.Content;

        return _node;
    }

    private _buildNode(objectType: string, objectShowName: string, position: Vec3 ) {
        let node = instantiate(this.objectPrefab);
        let content =  node.getComponent(ContentObject);
        content.objectType = objectType;
        content.objectPicture = "content/picture/content_object_" + objectType + "/spriteFrame";
        content.objectShowName = objectShowName;
        let button = node.getComponent(Button);
        button.enabled = false;

        let parentNode = this.item;

        parentNode.addChild(node);
        node.position = position;

        return node;
    }

    _flushDragPostion() {
        if(this.dragNode) {
            this.dragNode.position = v3(this.mousePos.x - 640, this.mousePos.y - 320, 0);
        }
    }
}

