import { _decorator, Component, Node, director, input, Input, EventMouse, Prefab, instantiate, v3, Vec2, EventTouch, Button, sys, Vec3, v2, EventKeyboard, KeyCode, Graphics } from 'cc';
import { ContentObject } from '../../content/script/ContentObject';
import { DragController } from '../../content/script/DragController';
import { SpanController } from './SpanController';
import { RouteController } from './RouteController';
import { RenderObject } from '../../common/script/RenderObject';
import { RenderDelete } from '../../common/script/RenderDelete';
import { LinkController } from './LinkController';
import { DirectionController } from '../../common/script/DirectionController';
const { ccclass, property } = _decorator;

@ccclass('RenderController')
export class RenderController extends Component {
    @property({type: Prefab})
    public objectPrefab: Prefab;

    @property({type: Node})
    public item: Node;

    @property({type: Node})
    public line: Node;

    @property({type: Node})
    public road: Node;

    @property({type: Node})
    public path: Node;

    @property({type: Node})
    public agv: Node;

    @property({type: SpanController})
    public spanController: SpanController;

    @property({type: RouteController})
    public routeController: RouteController;

    @property({type: LinkController})
    public linkController: LinkController;

    @property({type: Prefab})
    public arrowPrefab: Prefab;
    
    @property({type: Node})
    public arrowNode: Node;

    /**
     * 选中的节点
     */
    private selectNode: Node;

    /**
     * 拖拽的节点
     */
    private dragNode: Node;

    /**
     * 鼠标位置
     */
    private mousePos: Vec2;


    onLoad() {
        director.on('plan_select', this._onPlanSelect, this);
        director.on('content_list_click', this._onContentListClick, this);
        director.on('render_save', this._onSave, this);
        director.on('render_line_refresh', this._onLineRefresh, this);

        director.on('render_link_play', this._onLinkPlay, this);
        director.on('render_link_stop', this._onLinkStop, this);

        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    onDestroy() {
        director.off('plan_select', this._onPlanSelect, this);
        director.off('content_list_click', this._onContentListClick, this);
        director.off('render_save', this._onSave, this);
        director.off('render_line_refresh', this._onLineRefresh, this);

        director.off('render_link_play', this._onLinkPlay, this);
        director.off('render_link_stop', this._onLinkStop, this);

        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    _clearAllItem() {
        this.item.removeAllChildren();
        this.road.removeAllChildren();
    }

    _onPlanSelect(planeName) {
        this._clearAllItem();
        this._loadItem(planeName);
        this._loadPoint(planeName);
        this._onLineRefresh();
    }

    _onKeyUp(event: EventKeyboard) {
        if( event.keyCode == KeyCode.KEY_D ) {
            if( this.selectNode ) {
                this.selectNode.removeFromParent();
                this.selectNode = null;
            }
        }

        if( event.keyCode == KeyCode.ESCAPE ) {
            this.selectNode = null;
            director.emit('render_object_unselect');
        }
    }

    _onContentListClick(objectType: string, objectShowName: string) {
        console.error('content list click: ', objectType, objectShowName);
        if( objectType == 'path' ) {
            this.routeController.node.active = true;
            return;
        }

        let node = this.spanController.buildNode(objectType, objectShowName);
        let content =  node.getComponent(ContentObject);
        content.clickFuncion = () => {
            console.error('content object click 2');
            this._onSelectItem(node);
            director.emit('render_content_click', content);
            director.emit('attribute_refresh', objectType);
        };

        this.spanController.node.active = true;
    }

    _flushDragPostion() {
        if(this.dragNode) {
            this.dragNode.position = v3(this.mousePos.x - 640, this.mousePos.y - 320, 0);
        }
    }

    _onSave() {
        let plan = sys.localStorage.getItem('plan_select');

        this._saveItem(plan);
        this._savePoint(plan);
    }

    _saveItem(plan: string) {
        let itemArray = [];
        for(let index in this.item.children) {
            let node = this.item.children[index];
            let content = node.getComponent(ContentObject);
            let renderObject = node.getComponent(RenderObject);

            itemArray.push({
                objectType: content.objectType,
                objectShowName: content.objectShowName,
                uniqueId: renderObject.uniqueId,
                rightId: renderObject.rightId,
                posX: node.position.x,
                posY: node.position.y
            });
        }

        sys.localStorage.setItem('plan_item:' + plan, JSON.stringify(itemArray));
    }

    _loadItem(plan: string) {
        let itemArray = JSON.parse(sys.localStorage.getItem('plan_item:' + plan));
        if( itemArray == null )
            return ;

        for(let index in itemArray) {
            let item = itemArray[index];

            let node = this.spanController.buildNodeWithPos(item.objectType, item.objectShowName, v3(item.posX, item.posY, 0), item.uniqueId);
            let _renderObject = node.getComponent(RenderObject);
            _renderObject.rightId = item.rightId;

            let controller = node.getComponent(DragController);
            controller.enabled = true;

            node.addComponent(RenderDelete);
        }
    }

    _loadPoint(plan: string) {
        let pointMap = JSON.parse(sys.localStorage.getItem('plan_point:' + plan));
        if( pointMap == null )
            return ;

        for(let uniqueId in pointMap) {
            let point = pointMap[uniqueId];

            let renderObject = this.routeController.buildPoint(v3(point.x, point.y, 0));
            renderObject.uniqueId = point.uniqueId;
            renderObject.rightId = point.rightId;

            renderObject.addComponent(RenderDelete);
        }
    }

    _savePoint(plan: string) {
        let pointMap = {};
        for(let index in this.road.children) {
            let node = this.road.children[index];
            let renderObject = node.getComponent(RenderObject);

            pointMap[renderObject.uniqueId] = {
                uniqueId: renderObject.uniqueId,
                rightId: renderObject.rightId,
                x: node.position.x,
                y: node.position.y
            };
        }

        sys.localStorage.setItem('plan_point:' + plan, JSON.stringify(pointMap));
    }

    _onSelectItem(node: Node) {
        console.error('contenett  select item');
        this.selectNode = node;
    }

    _onLineRefresh() {
        let graphics = this.line.getComponent(Graphics);
        graphics.clear();

        this._drawPath(graphics);
        this._drawLink(graphics);

        graphics.stroke();
    }

    /**
     * 画路径
     * @param graphics 
     */
    private _drawPath(graphics:Graphics) {
        if( this.road.children.length <= 0 )
            return;

        let _renderArray = this.road.getComponentsInChildren(RenderObject);
        for(let _key in _renderArray) {
            let _startRender = _renderArray[_key];

            if( _startRender.rightId == null || _startRender.rightId == "" ) {
                continue;
            }

            let _pointNode = this._findPointByUniqueId(_startRender.rightId); 
            if( _pointNode == null ) {
                continue;
            }

            graphics.moveTo(_startRender.node.position.x, _startRender.node.position.y);
            graphics.lineTo(_pointNode.node.position.x, _pointNode.node.position.y);
        }
    }

    private _drawLink(graphics:Graphics) {
        // 所有的箭头先去掉
        this.arrowNode.removeAllChildren();

        for(let _index = 0; _index < this.item.children.length; ++_index) {
            let _item = this.item.children[_index];
            let content = _item.getComponent(RenderObject);
            if( content == null || content.rightId == null || content.rightId == "" ) {
                continue;
            }

            let _rightId = content.rightId;
            let _point = this._findPointByUniqueId(_rightId);

            if( _point != null ) {
                graphics.moveTo(_item.position.x, _item.position.y);
                graphics.lineTo(_point.node.position.x, _point.node.position.y);

                this._addArrow(_item.position, _point.node.position);
            } else {
                let _rightItem = this._findContentByUniqueId(_rightId);
                if( _rightItem ) {
                    graphics.moveTo(_item.position.x, _item.position.y);
                    graphics.lineTo(_rightItem.node.position.x, _rightItem.node.position.y);

                    this._addArrow(_item.position, _rightItem.node.position);
                }
            }
        }
    }

    /**
     * 
     * @param position 
     */
    private _addArrow(startPosition:Vec3, endPosition:Vec3) {
        let _node = instantiate(this.arrowPrefab);
        let _direction = _node.getComponent(DirectionController);
        _direction.startPos = startPosition;
        _direction.endPos = endPosition;

        this.arrowNode.addChild(_node);

        _direction.updateDirection();
        _direction.node.position = v3(startPosition.x + (endPosition.x - startPosition.x) / 2, startPosition.y + (endPosition.y - startPosition.y) / 2, 0);
    }

    private _findContentByUniqueId(uniqueId:string) {
        for(let _index = 0; _index < this.item.children.length; ++_index) {
            let _item = this.item.children[_index];
            let content = _item.getComponent(RenderObject);
            if( content == null ) {
                continue;
            }

            if( content.uniqueId == uniqueId ) {
                return content;
            }
        }

        return null;
    }

    private _findPointByUniqueId(uniqueId:string) {
        for(let _index = 0; _index < this.road.children.length; ++_index) {
            let _item = this.road.children[_index];
            let content = _item.getComponent(RenderObject);
            if( content == null ) {
                continue;
            }

            if( content.uniqueId == uniqueId ) {
                return content;
            }
        }

        return null;
    }

    private _onLinkPlay() {
        this.linkController.node.active = true;
    }

    private _onLinkStop() {
        this.linkController.node.active = false;
    }
}

