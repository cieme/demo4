import { _decorator, Component, director, Node, sys } from 'cc';
import { TypeList } from './Matter';
const { ccclass, property } = _decorator;

export enum Status {
    Wait = "wait", 
    Run = "run",
    Hook = "hook",
    Unhook = "unhook"
};

@ccclass('Car')
export class Car {

    public carId:string;

    public carIndex:number;

    /**
     * agv类型
     */
    public agvType:string;

    /**
     * 状态时间轴
     */
    private statusTimeline = new Map<number, string>;

    /**
     * 当前状态
     */
    private _status:Status = Status.Wait;

    /**
     * 运行时间
     */
    private _runCount = 0;

    /**
     * 等待时间
     */
    private _waitTime = 0;

    /**
     * 上次状态变化时间
     */
    private _lastSatusTime = 0;

    /**
     * 时间
     */
    public _statusTime = 0;

    /**
     * 锁定物料
     */
    private _lockMatterMap = {};

    /**
     * 跑的起点
     */
    private _runStartPoint = "";

    /**
     * 跑的终点
     */
    private _runEndPoint = "";

    /**
     * 这是运行次数
     */
    public statisticsArray = new Array;

    public statisticsMap = new Map;

    /**
     * 获取小车的状态
     * @param time 
     */
    public getStatus(time:number) {
        return this._status;
    }

    /**
     * 启动
     * @param time 
     */
    public begin(time:number) {
        this._runCount = this._runCount + 1;
        this.statisticsArray.push({});
    }

    /**
     * 小车状态
     * @param time 
     * @param status 
     */
    public statusChange(time:number, status:Status) {
        let _lastStatus = this._status;
        let _lastStatusTime = time - this._lastSatusTime;
        this._addStatisticsTime(_lastStatus, _lastStatusTime);

        this.statusTimeline[time] = status;
        this._status = status;
        this._lastSatusTime = time;
        if( this._status == Status.Wait ) {
            this._waitTime = time;
        }
    }

    /**
     * 是否可以这个类型操作
     * @param agvType 
     * @returns 
     */
    public hasType(type:string) {
        return this.agvType.indexOf(type) != -1;
    }

    /**
     * 状态次数
     * @param time 
     */
    public getStatusCount(time:number, status:Status) {
        let _count = 0;
        for(let _key in this.statusTimeline) {
            if( time < Number(_key) ) {
                break;
            }

            let _status = this.statusTimeline[_key];
            if( _status == status ) {
                ++_count;
            }
        }

        return _count;
    }

    /**
     * 上次时间
     * @param time 
     * @param status 
     * @returns 
     */
    public getLastWaitTime(time:number) {
        return this._waitTime;
    }

    public getLastStatusTime() {
        return this._lastSatusTime;
    }

    public getRunEndPoint() {
        return this._runEndPoint;
    }

    public getRunTime() {
        return this._statusTime;
    }

    /**
     * 锁定物料数量
     * @param time 
     * @param type 
     * @param count 
     */
    public lockMatter(time:number, type:TypeList, count:number) {
        this._lockMatterMap[type] = count;
    }

    public getLock() {
        return this._lockMatterMap;
    }

    public clearLock() {
        this._lockMatterMap = {}
    }

    public getLockList() {
        let _countList = new Array<number>;
        for(let _index in TypeList) {
            let _typeList = TypeList[_index];
            if( this._lockMatterMap[_typeList] == null ) {
                _countList.push(0);
            } else {
                _countList.push(this._lockMatterMap[_typeList]);
            }
        }

        return _countList;
    }

    /**
     * 已经锁定的数量
     * @returns 
     */
    public lockCount() {
        if( this._lockMatterMap == null )
            return 0;
        let _count = 0;
        for(let _type in this._lockMatterMap) {
            _count += this._lockMatterMap[_type];
        }

        return _count;
    }

    /**
     * 起点
     * @param startPoint 
     * @param endPoint 
     */
    public run(startPoint:string, endPoint:string) {
        this._runStartPoint = startPoint;
        this._runEndPoint = endPoint;
    }

    /**
     * 跑的时间
     * @param runTime 
     */
    public runTime(runTime:number) {
        this._statusTime = runTime;
    }

    /**
     * 添加统计时间
     * @param status 
     * @param time 
     */
    private _addStatisticsTime(status:Status, time:number) {
        let _statisticsTime = this.statisticsArray[this.statisticsArray.length - 1];
        let _totalTime = _statisticsTime[status];
        if( _totalTime == null ) {
            _totalTime = time;
        } else {
            _totalTime = _totalTime + time;
        }

        _statisticsTime[status] = _totalTime;

        this._addStatisticsTotalTime(status, time);
    }

    private _addStatisticsTotalTime(status:Status, time:number) {
        let _totalTime = this.statisticsMap[status];
        if( _totalTime == null ) {
            _totalTime = time;
        } else {
            _totalTime = _totalTime + time;
        }

        this.statisticsMap[status] = _totalTime;

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            sys.localStorage.setItem('render_play_car_' + this.carIndex, JSON.stringify(this.statisticsMap));
            director.emit('render_play_detection_refresh');
        }
    } 
}

