import { _decorator, Component, director, Node, sys } from 'cc';
import { Matter, TypeList } from './Matter';
import { Entry } from './Entry';
const { ccclass, property } = _decorator;

/**
 * 混存区
 */
@ccclass('Cache')
export class Cache {

    public uniqueId:string;

    /**
     * 输入时间轴
     */
    private _inputTimeline = new Array<Matter>;

    /**
     * 输出标志
     */
    private _outputFlag = [];

    /**
     * 输出时间轴
     */
    private _outputTimeline = [];

    /**
     * 入口
     */
    private _entry:Entry;

    /**
     * 队列
     */
    private _matterQueue = new Array<Matter>;

    /**
     * 预定的列表 -- 已经被小车选中的
     */
    private _fixMatter = new Array<Matter>;

    /**
     * 设置入口
     * @param entry 
     */
    public setEntry(entry:Entry) {
        this._entry = entry;
    }

    /**
     * 处理
     * @param time 
     */
    public handle(time:number) {
        // console.error('cache heart: ', time, this._matterQueue.length, this._fixMatter.length);
        let _count = this._entry.getMatterCount();
        if( _count <= 0)
            return;

        for(let _index = 0; _index < _count; ++_index) {
            let _matter = this._entry.takeMatter();
            
            this.inputHandle(time, _matter);

            this._refreshCount();
        }
    }

    /**
     * 插入物料
     * @param time 
     * @param matter 
     */
    public inputHandle(time:number, matter:Matter) {
        matter.inputCacheTime = time;

        this._inputTimeline.push(matter);
        this._outputFlag.push(true);
        this._matterQueue.push(matter);
    }

    /**
     * 离开缓存区
     * @param time 
     * @param type 
     * @returns 
     */
    public takeMatter(time:number, type:string) : Matter {
        let _matter = null;
        for(let _index = 0; _index < this._matterQueue.length; ++_index) {
            _matter = this._matterQueue[_index];
            if( _matter.type == type ) {
                _matter.outputCacheTime = time;

                this._matterQueue.splice(_index, 1);
                this._removeFixMatter(time, type);

                break;
            }
        }

        this._refreshCount();

        return _matter;
    }

    /**
     * 预定物料
     * @param time 
     * @param type 
     * @param count 
     */
    public fixMatter(time:number, type:string, count:number) {
        if( count <= 0 ) {
            return;
        }
        let _count = 0;
        for(let _index = 0; _index < this._matterQueue.length; ++_index) {
            let _matter = this._matterQueue[_index];
            if( _matter.type == type ) {
                this._fixMatter.push(_matter);
                ++_count;
                if( _count >= count ) {
                    break;
                }
            }
        }
    }

    /**
     * 从预定中移除一个
     * @param time 
     * @param type 
     */
    private _removeFixMatter(time:number, type:string) {
        for(let _index = 0; _index < this._fixMatter.length; ++_index) {
            let _matter = this._fixMatter[_index];
            if( _matter.type == type ) {
                this._fixMatter.splice(_index, 1);
                break;
            }
        }
    }

    /**
     * 获取数量
     * @param time 
     */
    public getCount(time:number) : number {
        return this._matterQueue.length;
    }

    /**
     * 获得剩余数量
     * @param time 
     */
    public getLeftCount(time:number) {
        return this._entry.getLeftCount();
    }

    /**
     * 获得剩余数量
     * @param time 
     */
    public getLeftCountByType(time:number, type:TypeList) {
        return this._entry.getLeftCountByType(type);
    }

    /**
     * 查找这一类型
     * @param time 
     * @param type 
     * @returns 
     */
    public getCountByType(time:number, type:string) : number {
        let _count = 0;
        for(let _index = 0; _index < this._matterQueue.length; ++_index) {
            let _matter = this._matterQueue[_index];
            if( _matter.type == type ) {
                ++_count;
            }
        }

        return _count;
    }

    /**
     * 预定的数量
     * @param time 
     * @param type 
     * @returns 
     */
    public getFixCountByType(time:number, type:string) : number {
        let _count = 0;
        for(let _index = 0; _index < this._fixMatter.length; ++_index) {
            let _matter = this._fixMatter[_index];
            if( _matter.type == type ) {
                ++_count;
            }
        }

        return _count;
    }

    /**
     * 查找物料
     * @param time 
     * @param type 
     */
    private _findMatter(time:number, type:string) : Matter {
        for(let _index = 0; _index < this._matterQueue.length; ++_index) {
            let _matter = this._matterQueue[_index];
            if( _matter.inputCacheTime > time )
                break;

            if( _matter.type != type ) {
                continue;
            }

            return _matter;
        }

        return null;
    }

    private _refreshCount() {
        let _total = 0;
        let _countList = new Array<number>;
        for(let _index in TypeList) {
            let _count = this.getCountByType(0, TypeList[_index]);
            _countList.push(_count);

            _total = _count + _total;
        }

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            sys.localStorage.setItem('render_play_staging', _total.toString());
            
            director.emit('render_matter_refresh', this.uniqueId, _countList);
        }
    }
}

