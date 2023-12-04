import { _decorator, Component, director, EventKeyboard, EventMouse, EventTouch, Graphics, Input, input, KeyCode, Node, UITransform, v3, Vec3 } from 'cc';
import { RenderObject } from '../../common/script/RenderObject';
import { DirectionController } from '../../common/script/DirectionController';
const { ccclass, property } = _decorator;

@ccclass('LinkController')
export class LinkController extends Component {
    @property({type: Node})
    public road: Node;

    @property({type: Node})
    public item: Node;

    @property({type: DirectionController})
    public arrow: DirectionController;

    /**
     * 画图程序
     */
    private graphics:Graphics;

    /**
     * 点击事件
     */
    private clickRender: RenderObject = null;

    private uiTransform: UITransform;
    
    onLoad() {
        this.graphics = this.getComponent(Graphics);
        this.uiTransform = this.getComponent(UITransform);
    }
    
    onEnable() {
        this.clickRender = null;
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchUp, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    onDisable() {
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchUp, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);

        this.clickRender = null;
        this.graphics.clear();
        this.arrow.node.active = false;
    }

    _onMouseMove(event: EventMouse) {
        if( this.clickRender != null ) {
            let pos = v3(event.getUILocation().x - this.uiTransform.width * this.uiTransform.anchorX, event.getUILocation().y - this.uiTransform.height * this.uiTransform.anchorY, 0);
            this._drawLine(this.clickRender.node.position, pos);
        } else {
            this.arrow.node.active = false;
        }
    }

    _onTouchUp(event: EventTouch) {
        let clickPosition = v3(event.getUILocation().x - this.uiTransform.anchorX * this.uiTransform.width, event.getUILocation().y - this.uiTransform.anchorY * this.uiTransform.height, 0);
        let _item = this._getTouchContent(clickPosition);
        if( _item != null ) {
            this._onContentClick(_item);
            return;
        }

        let _point = this._getTouchPoint(clickPosition);
        if( _point != null ) {
            this._onPositionClick(_point);
            return;
        }
    }

    public _onPositionClick(pointRender:RenderObject) {
        if( this.clickRender != null && this.clickRender != pointRender ) {
            // 做连线
            this.clickRender.rightId = pointRender.uniqueId;

            this.clickRender = null;
            this.graphics.clear();

            director.emit('render_line_refresh');

            director.emit('render_link_hide');
            this.node.active = false;
            this.arrow.node.active = false;
        } else {
            this.clickRender = pointRender;
        }
    }

    public _onContentClick(renderObject:RenderObject) {
        if( this.clickRender != null && this.clickRender != renderObject ) {
            // 做连线
            this.clickRender.rightId = renderObject.uniqueId;
            this.graphics.clear();

            director.emit('render_line_refresh');
            this.arrow.node.active = false;
        }

        this.clickRender = renderObject;
    }

    _onKeyUp(event: EventKeyboard) {
        if( event.keyCode == KeyCode.ESCAPE ) {
            // 没有画出来路
            if( this.road.children.length <= 0 ) {
                this.road.removeAllChildren();
            }

            this.clickRender = null;
            this.arrow.node.active = false;
            this.node.active = false;
        }
    }

    /**
     * 划线
     * @param start 
     * @param end 
     */
    private _drawLine(start:Vec3, end:Vec3) {
        this.graphics.clear();
        this.graphics.moveTo(start.x, start.y);
        this.graphics.lineTo(end.x, end.y);

        this.graphics.stroke();

        this._updateArrow(start, end);
    }

    /**
     * 
     * @param position 
     */
    private _updateArrow(startPosition:Vec3, endPosition:Vec3) {
        this.arrow.node.active = true;
        this.arrow.startPos = startPosition;
        this.arrow.endPos = endPosition;

        this.arrow.updateDirection();
        this.arrow.node.position = v3(startPosition.x + (endPosition.x - startPosition.x) / 2, startPosition.y + (endPosition.y - startPosition.y) / 2, 0);
    }

    /**
     * 获取点击的事件
     * @param pos 
     */
    private _getTouchContent(pos:Vec3) {
        for(let _index = 0; _index < this.item.children.length; ++_index) {
            let _itemNode = this.item.children[_index];
            if( this._isInItem(_itemNode, pos) ) {
                return _itemNode.getComponent(RenderObject);
            }
        }

        return null;
    }

    /**
     * 是否在点上
     * @param pos 
     * @returns 
     */
    private _getTouchPoint(pos:Vec3) {
        for(let _index = 0; _index < this.road.children.length; ++_index) {
            let _itemNode = this.road.children[_index];
            if( this._isInItem(_itemNode, pos) ) {
                return _itemNode.getComponent(RenderObject);
            }
        }

        return null;
    }

    private _isInItem(node:Node, pos:Vec3) {
        let _uiTransform = node.getComponent(UITransform);
        let _startX = node.position.x - _uiTransform.anchorX * _uiTransform.width;
        let _startY = node.position.y - _uiTransform.anchorY * _uiTransform.height;

        let _endX = node.position.x + _uiTransform.anchorX * _uiTransform.width;
        let _endY = node.position.y + _uiTransform.anchorY * _uiTransform.height;

        if( pos.x >= _startX && pos.x <= _endX && pos.y >= _startY && pos.y <= _endY ) {
            return true;
        }

        return false;
    }
}

