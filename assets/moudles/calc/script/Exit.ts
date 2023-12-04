import { _decorator, Component, director, Node, sys } from 'cc';
import { TypeList } from './Matter';
const { ccclass, property } = _decorator;

/**
 * 出口
 */
@ccclass('Exit')
export class Exit {
    public uniqueId:string;

    public rightId:string;

    public index:number;

    public matterMap:Map<string, number> = new Map<string, number>;

    public total:number = 0;

    public appendMatter(type:string, count:number) {
        let _value = 0;
        let _before = this.matterMap[type];
        if( _before == null ) {
            _value = count;
        } else {
            _value = _before + count;
        }

        this.matterMap[type] = _value;
        this.total = this.total + count;

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            sys.localStorage.setItem('render_play_exit_' + this.index, this.total.toString());
        }

        this._onRefresh();
    }

    private _onRefresh() {
        let _countList = new Array<number>;
        for(let index in TypeList) {
            let count = this.matterMap[TypeList[index]];
            
            _countList.push(count == null ? 0 : count);
        }

        director.emit('render_matter_refresh', this.uniqueId, _countList);
    }
}

