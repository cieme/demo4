import { _decorator, Component, director, EditBox, Node, resources, Sprite, SpriteFrame, sys, Widget } from 'cc';
import { ContentObject } from '../../content/script/ContentObject';
const { ccclass, property } = _decorator;

@ccclass('AttributeController')
export class AttributeController extends Component {

    @property({type:EditBox})
    private spaceHour:EditBox;

    @property({type:EditBox})
    private spaceMinute:EditBox;

    @property({type:EditBox})
    private spaceSecond:EditBox;

    @property({type:EditBox})
    private spaceMilli:EditBox;

    @property({type:EditBox})
    private total:EditBox;

    @property({type:Sprite})
    private image:Sprite;

    onLoad() {
        director.on('plan_select', this._onPlanSelect, this);
    }

    onDestroy() {
        director.off('plan_select', this._onPlanSelect, this);
    }

    protected onEnable(): void {
        this.image.node.active = false;
        director.on('render_object_select', this._onRefresh, this);
    }

    protected onDisable(): void {
        director.off('render_object_select', this._onRefresh, this);
    }

    private _onPlanSelect(plan:string) {
        let entryParam = JSON.parse(sys.localStorage.getItem('plan_entry_param:' + plan));
        if( entryParam != null ) {
            this._refreshSpace( Number(entryParam['spanSpace']) );
            this.total.string = entryParam['spanTotal'];
        }
        else{
            this._refreshSpace( 10 );
            this.total.string = '100';
        }
    }

    /**
     * 生产间隔改变
     */
    private onEditChanged() {
        this._saveEntryParam();
    }

    private _refreshSpace(space:number) {
        if( space == null )
            space = 10;

        this.spaceMilli.string = "0"
        this.spaceSecond.string = (space % 60).toString();
        let minute = Math.floor(space / 60);
        this.spaceMinute.string = (minute % 60).toString();
        this.spaceHour.string = Math.floor(minute / 60).toString();
    }

    private _saveEntryParam() {
        let _hour = Number(this.spaceHour.string);
        let _minute = Number(this.spaceMinute.string);
        let _second = Number(this.spaceSecond.string);

        let entryParam = {};
        entryParam['spanSpace'] = _hour * 3600 + _minute * 60 + _second;
        entryParam['spanTotal'] = Number(this.total.string);

        let plan = sys.localStorage.getItem('plan_select');

        sys.localStorage.setItem('plan_entry_param:' + plan, JSON.stringify(entryParam));
    }

    private _onRefresh(node:Node) {
        let _content = node.getComponent(ContentObject);
        if( _content == null )
            return;

        console.error('attribute refresh: ', _content.objectType);
        resources.load('attribute/picture/' + _content.objectType + "/spriteFrame", SpriteFrame, (err, spriteFrame: SpriteFrame) => {
            if( err != null ) {
                this.image.node.active = false;
                return;
            }
            this.image.spriteFrame = spriteFrame;
            this.image.node.active = true;

            let _widget = this.image.node.getComponent(Widget);
            if( _widget != null ) {
                _widget.top = 0;
            }
        });
    }
}

