import { _decorator, Component, director, Node, sp, sys } from 'cc';
import { MatterAlloc } from './MatterAlloc';
import { Matter, TypeList } from './Matter';
const { ccclass, property } = _decorator;

/**
 * 入口
 */
@ccclass('Entry')
export class Entry {

    /**
     * 生产时间轴
     */
    private _metterTimeline = [];

    /**
     * 生产间隔
     */
    private _space:number;

    /**
     * 总数量
     */
    private _total:number;

    /**
     * 比例
     */
    private _metterAllocRatio:Array<MatterAlloc>;

    /**
     * 生产顺序
     */
    private _metterAllocOrder:Array<string> = new Array;

    /**
     * 上次生产时间
     */
    private _lastSpanTime = -100000;

    /**
     * 当前物料列表
     */
    private _currentMatterList = new Array<Matter>;

    /**
     * 已经产生的物料数量
     */
    public matterMap:Map<string, number> = new Map<string, number>;

    /**
     * 初始化
     * @param space 
     * @param total 
     * @param metterAllocRatio 
     */
    public init(space:number, total:number, metterAllocRatio:Array<MatterAlloc>) {
        this._space = space;
        this._total = total;
        this._metterAllocRatio = metterAllocRatio;

        this._randomMatter();
    }

    /**
     * 数据处理
     * @param time 
     */
    public handle(time:number) {
        if( time < this._lastSpanTime + this._space ) {
            return;
        }

        /**
         * 这里代表都已经生产完了
         */
        if( this._metterTimeline.length >= this._metterAllocOrder.length ) {
            return;
        }

        let _matter = this._createMatter(time);
    }

    /**
     * 获取物料数量
     */
    public getMatterCount() {
        return this._currentMatterList.length;
    }

    /**
     * 拿走一个
     * @returns 
     */
    public takeMatter() {
        let _matter = this._currentMatterList.pop();

        return _matter;
    }

    /**
     * 剩余数量
     * @returns 
     */
    public getLeftCount() {
        return this._metterAllocOrder.length - this._metterTimeline.length;
    }

    /**
     * 获取剩余数量
     */
    public getLeftCountByType(type:TypeList) {
        let _count = 0;
        for(let _index = this._metterTimeline.length; _index < this._metterAllocOrder.length; ++_index) {
            if( this._metterAllocOrder[_index] == type ) {
                ++_count;
            }
        }

        return _count;
    }

    /**
     * 随机物料生产顺序
     */
    private _randomMatter() {
        for(let _index = 0; _index < this._metterAllocRatio.length; ++_index) {
            let _allocRatio = this._metterAllocRatio[_index];
            let _count = Math.floor(_allocRatio.ratio * this._total);
            for(let _allocIndex = 0; _allocIndex < _count; ++_allocIndex) {
                this._metterAllocOrder.push(_allocRatio.type);
            }
        }

        if( this._metterAllocOrder.length < this._total ) {
            for(let _index = this._metterAllocOrder.length; _index < this._total; ++_index) {
                this._metterAllocOrder.push(this._metterAllocRatio[this._metterAllocOrder.length - 1].type);
            }
        } else if ( this._metterAllocOrder.length > this._total ) {
            this._metterAllocOrder.slice(this._total, this._metterAllocOrder.length);
        }

        this._metterAllocOrder.sort(() => Math.random() - 0.5);
    }

    /**
     * 创建物料
     * @param time 
     */
    private _createMatter(time:number) {
        this._lastSpanTime = time;
        let _matterType = this._metterAllocOrder[this._metterTimeline.length];

        let _matter = new Matter;
        _matter.spanTime = time;
        _matter.type = _matterType;

        this._metterTimeline.push(_matter);

        this._currentMatterList.push(_matter);
        this._onCreateMatter(_matterType);
    }

    private _onCreateMatter(type:string) {
        let _value = this.matterMap[type];
        if( _value == null ) {
            _value = 1;
        } else {
            _value = _value + 1;
        }

        this.matterMap[type] = _value;

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            sys.localStorage.setItem('render_play_entry_' + type, _value.toString());

            director.emit('render_play_detection_refresh');
        }
    }
}

