import { _decorator, Component, Node, v2, Vec2 } from 'cc';
import { Config } from './Config';
import { Exit } from './Exit';
const { ccclass, property } = _decorator;

@ccclass('Route')
export class Route {
    /**
     * 路径列表
     */
    private _posArray = [];

    /**
     * 点的map
     */
    private _pointMap = {};

    /**
     * 缓存区路径点
     */
    private _cachePoint = "";

    /**
     * 启动节点
     */
    private _startPosIndex = "";

    /**
     * 出口
     */
    private _exportPosIndex = [];

    private _exportList: Array<Exit>;

    /**
     * 初始化
     * @param config 
     */
    public init(config: Config, exportList:Array<Exit>) {
        this._pointMap = config.pointMap;
        this._cachePoint = config.cachePosIndex;
        this._startPosIndex = config.startPosIndex;
        this._exportPosIndex = config.exportPosIndex;
        this._exportList = exportList;
    }

    /**
     * 混存点路径
     * @returns 
     */
    public getCachePoint() {
        return this._cachePoint;
    }

    /**
     * 起点
     * @returns 
     */
    public getStartPoint() {
        return this._startPosIndex;
    }

    /**
     * 出口列表
     * @returns 
     */
    public getExportPointArray() {
        return this._exportPosIndex;
    }

    public getExportPoint() {
        return this._exportPosIndex[Math.floor(Math.random() * this._exportPosIndex.length)];
    }

    public isExportPoint(index:string) {
        return this._exportPosIndex.indexOf(index) != -1;
    }

    public findExit(rightId:string) {
        for(let _index in this._exportList) {
            let _exit = this._exportList[_index];
            if( _exit.rightId == rightId ) {
                return _exit;
            }
        }

        return null;
    }

    /**
     * 计算路径
     * @param startIndex 
     * @param endIndex 
     * @param speed 
     */
    public calcRunTime(startId:string, endId:string, speed:number){
        let _pathArray = this._getRunPath(startId, endId);
        let _distance = 0;
        for(let _index = 0; _index + 1 < _pathArray.length; ++_index) {
            let _startPoint = _pathArray[_index];
            let _endPoint = _pathArray[_index + 1];

            let _startPosition = v2(_startPoint.x, _startPoint.y);
            let _endPosition = v2(_endPoint.x, _endPoint.y);

            _distance += Vec2.distance(_startPosition, _endPosition);
        }

        return _distance / speed;
    }

    /**
     * 获取路径
     * @param startIndex 
     * @param endIndex 
     */
    private _getRunPath(startPoint:string, endPoint:string) {
        let _pathArray = [];
        let _curPoint = startPoint;

        let maxCount = Object.keys(this._pointMap).length;
        for(let _index = 0; _index < maxCount; ++_index) {
            let _point = this._pointMap[_curPoint];
            _pathArray.push(_point);

            if( _point.uniqueId == endPoint ) {
                break;
            }

            _curPoint = _point.rightId;
        }

        return _pathArray;
    }
}

