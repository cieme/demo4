import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RenderStatus')
export class RenderStatus extends Component {
    @property({type: Node})
    public select: Node;

    @property({type: Node})
    public hover: Node;

    /**
     * 是否选择标记
     */
    private _selectFlag = false;

    private _hoverFlag = false;

    protected onEnable(): void {
        this.node.on(Node.EventType.MOUSE_ENTER, this._onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this._onMouseLeave, this);

        director.on('render_object_select', this._onSelect, this);
        director.on('render_object_unselect', this._onUnSelect, this);
    }

    protected onDisable(): void {
        this.node.off(Node.EventType.MOUSE_ENTER, this._onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this._onMouseLeave, this);

        director.off('render_object_select', this._onSelect, this);
        director.off('render_object_unselect', this._onUnSelect, this);
    }

    public isSelect() {
        return this._selectFlag;
    }

    private _onMouseEnter() {
        this._hoverFlag = true;
        this._refreshStatus();
    }

    private _onMouseLeave() {
        this._hoverFlag = false;
        this._refreshStatus();
    }

    private _onSelect(node:Node) {
        this._selectFlag = (this.node == node);
        this._refreshStatus();
    }

    private _onUnSelect() {
        this._selectFlag = false;
        this._refreshStatus();
    }

    private _refreshStatus() {
        if( this.select ) {
            this.select.active = this._selectFlag;
        }

        if( this.hover ) {
            this.hover.active = (!this._selectFlag && this._hoverFlag);
        }
    }
}

