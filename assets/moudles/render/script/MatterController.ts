import { _decorator, Component, director, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MatterController')
export class MatterController extends Component {
    @property({type: [Label]})
    public listMatter:Label[] = new Array<Label>;

    public uniqueId:string;

    protected onEnable(): void {
        director.on('render_matter_refresh', this._onRefreshMatter, this);
        director.on('plan_play_stop', this._onPlayStop, this);
        director.on('render_play_end', this._onPlayStop, this);
        this._onRefreshMatter(this.uniqueId, null);
    }

    protected onDisable(): void {
        director.off('render_matter_refresh', this._onRefreshMatter, this);
        director.off('plan_play_stop', this._onPlayStop, this);
        director.off('render_play_end', this._onPlayStop, this);
    }

    public refreshMatter(uniqueId:string, countList:number[]) {
        this._onRefreshMatter(uniqueId, countList);
    }

    private _onRefreshMatter(uniqueId:string, countList:number[]) {
        if( this.uniqueId != uniqueId )
            return;

        let _count = this.listMatter.length;
        for( let _index = 0; _index < _count; ++_index ) {
            let _label = this.listMatter[_index];
            let _value = '0';
            if( countList != null && _index < countList.length ) {
                _value = '' + countList[_index];
            }

            _label.string = _value;
        }
    }

    private _onPlayStop() {
        this.node.removeFromParent();
    }
}

