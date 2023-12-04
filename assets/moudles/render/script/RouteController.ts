import { _decorator, Component, director, EventKeyboard, EventMouse, EventTouch, Graphics, input, Input, instantiate, KeyCode, Node, Prefab, UITransform, v3, Vec3 } from 'cc';
import { RenderObject, RenderType } from '../../common/script/RenderObject';
import { RenderDelete } from '../../common/script/RenderDelete';
import { RenderStatus } from '../../common/script/RenderStatus';
import { DragController } from '../../content/script/DragController';
const { ccclass, property } = _decorator;

@ccclass('RouteController')
export class RouteController extends Component {
    @property({type: Prefab})
    public objectPrefab: Prefab;

    @property({type: Node})
    public road: Node;

    @property({type: Node})
    public item: Node;

    /**
     * 画图程序
     */
    private graphics:Graphics;

    /**
     * 点击事件
     */
    private clickRender: RenderObject = null;

    private uiTransform: UITransform;

    /**
     * 是否按下了shift
     */
    private shiftFlag: boolean = false;

    onLoad() {
        this.graphics = this.getComponent(Graphics);
        this.uiTransform = this.getComponent(UITransform);
    }
    
    onEnable() {
        this.clickRender = null;
        this.shiftFlag = false;
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchUp, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
    }

    onDisable() {
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchUp, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);

        this.clickRender = null;
        this.shiftFlag = false;
    }

    _onMouseMove(event: EventMouse) {
        if( this.clickRender != null ) {
            let pos = v3(event.getUILocation().x - this.uiTransform.width * this.uiTransform.anchorX, event.getUILocation().y - this.uiTransform.height * this.uiTransform.anchorY, 0);
            
            let modifyPos = this._calcRealPosition(pos);
            
            this._drawLine(this.clickRender.node.position, modifyPos);
        }
    }

    _onTouchUp(event: EventTouch) {
        let clickPosition = v3(event.getUILocation().x - this.uiTransform.anchorX * this.uiTransform.width, event.getUILocation().y - this.uiTransform.anchorY * this.uiTransform.height, 0);
        let _item = this._getTouchContent(clickPosition);
        if( _item != null ) {
            return;
        }

        let _point = this._getTouchPoint(clickPosition);
        if( _point != null ) {
            this._onPositionClick(_point);
            return;
        }

        let modifyPos = this._calcRealPosition(clickPosition);

        let _renderObject = this.buildPoint(modifyPos);
        _renderObject.node.name = "pos_" + (this.road.children.length - 1);
        _renderObject.uniqueId = Date.now().toString() + (10000 + Math.floor(Math.random() * 99999));
        if(this.clickRender != null) {
            this.clickRender.rightId = _renderObject.uniqueId;
        }

        _renderObject.addComponent(RenderDelete);

        this.clickRender = _renderObject;

        director.emit('render_line_refresh');
    }

    _onKeyDown(event: EventKeyboard) {
        if( event.keyCode == KeyCode.SHIFT_LEFT || event.keyCode == KeyCode.SHIFT_RIGHT ) {
            this.shiftFlag = true;
        }
    }

    _onKeyUp(event: EventKeyboard) {
        if( event.keyCode == KeyCode.SHIFT_LEFT || event.keyCode == KeyCode.SHIFT_RIGHT ) {
            this.shiftFlag = false;
        }

        if( event.keyCode == KeyCode.ESCAPE ) {
            // 没有画出来路
            if( this.road.children.length <= 0 ) {
                this.road.removeAllChildren();
            }

            this.clickRender = null;
            this.node.active = false;
        }
    }

    public buildPoint(pos:Vec3) {
        let _node = instantiate(this.objectPrefab);
        let _renderObject = _node.addComponent(RenderObject);
        _renderObject.renderType = RenderType.Point;

        _node.addComponent(DragController);
        _node.addComponent(RenderStatus);
        _node.addComponent(RenderDelete);

        _node.position = pos;
        this.road.addChild(_node);

        return _renderObject;
    }

    public _onPositionClick(pointRender:RenderObject) {
        if( this.clickRender != null && this.clickRender != pointRender ) {
            // 做连线
            this.clickRender.rightId = pointRender.uniqueId;

            this.clickRender = null;
            this.graphics.clear();

            this.node.active = false;
            director.emit('render_line_refresh');
        } else {
            this.clickRender = pointRender;
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

    /**
     * 计算真实的位置
     * @param movePosition 
     */
    private _calcRealPosition(movePosition: Vec3) {
        if( this.shiftFlag == false || this.clickRender == null )
            return movePosition;

        let startPosition = this.clickRender.node.position;
        let _distance = Vec3.distance(startPosition, movePosition);
        let _xDistance = Vec3.distance(startPosition, v3(movePosition.x, startPosition.y, 0));
        let _yDistance = Vec3.distance(startPosition, v3(startPosition.x, movePosition.y, 0));
        if( _xDistance == _yDistance ) {
            return movePosition;
        }

        if( _xDistance > _yDistance ) {
            let _flag = (movePosition.x > startPosition.x) ? 1 : -1
            return v3(startPosition.x + _flag * _distance, startPosition.y, 0);
        } else {
            let _flag = (movePosition.y > startPosition.y) ? 1 : -1
            return v3(startPosition.x, startPosition.y + _flag * _distance, 0);
        }
    }
}

