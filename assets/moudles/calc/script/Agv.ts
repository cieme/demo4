import { _decorator, Component, director, Node, sys } from 'cc';
import { Car, Status } from './Car';
import { Cache } from './Cache';
import { Config } from './Config';
import { Matter, TypeList } from './Matter';
import { Route } from './Route';
const { ccclass, property } = _decorator;

@ccclass('Agv')
export class Agv {
    /**
     * 混存区
     */
    private cache : Cache;

    /**
     * 路径
     */
    private route : Route;

    /**
     * 配置
     */
    private config : Config;

    /**
     * 车列表
     */
    private carList : Array<Car> = [];

    /**
     * 需求时间轴
     */
    private demandTimeline = {};

    /**
     * 需求间隔
     */
    private demand_space = 3600;

    public init(cache : Cache, config:Config, route:Route) {
        this.cache = cache;
        this.config = config;
        this.route = route;

        let _index = 0;
        for(let _key in this.config.agvType) {
            let _type = this.config.agvType[_key];
            this._spanCar(_type, 'car_' + _index);

            _index = _index + 1;
        }

        sys.localStorage.setItem('render_play_car_count', this.config.agvType.length.toString());
    }

    /**
     * 产生小汽车
     * @param type 
     */
    public _spanCar(type:string, carId:string) {
        let _car = new Car;
        _car.agvType = type;
        _car.carId = carId;
        _car.carIndex = this.carList.length;

        this.carList.push(_car);
    }

    /**
     * 获取小车状态的数量
     * @param time 
     * @param status 
     * @returns 
     */
    public getCarCount(time:number, status:Status) {
        let _count = 0;
        for(let _index in this.carList) {
            let _car = this.carList[_index];
            if( _car.getStatus(time) == status ) {
                ++_count;
            }
        }

        return _count;
    }

    public getCarCountByType(time:number, status:Status, type:string) {
        let _count = 0;
        for(let _index in this.carList) {
            let _car = this.carList[_index];
            if( _car.getStatus(time) == status && _car.hasType(type) ) {
                ++_count;
            }
        }

        return _count;
    }

    /**
     * 总处理入口
     * @param time 
     */
    public handle(time:number) : boolean {
        // 先处理小车的状态
        this._handleCar(time);

        if( this.isAllCarRun(time) ) {
            return;
        }

        // 下面处理小车是否可以启动
        let _count = this.cache.getCount(time);
        let _leftCount = this.cache.getLeftCount(time);
        if( _count == 0 ) {
            return false;
        } else if(_count < this.config.dragCount) {
            if( _leftCount == 0 ) {
                let _type = this._findMatterCheck(time);
                if( _type == null )  {
                    return false;
                }

                console.error('find type1: ', time, _type);
                this._realHandle(time, _type);
                return true;
            }
        } else if(_count >= this.config.dragCount) {
            let _type = this._findMatterPerfect(time);
            if( _type == null ) {
                _type = this._findMatterCheck(time);
            }

            if( _type == null ) {
                return false;
            }

            this._realHandle(time, _type);
            return true;
        }

        return false;
    }

    /**
     * 是否所有的小车都是在起点的等待状态
     * @param time 
     * @returns 
     */
    public isAllCarWait(time:number) {
        for(let _key in  this.carList) {
            let _car = this.carList[_key];
            if( _car.getStatus(time) != Status.Wait ) {
                return false;
            }
        }

        return true;
    }

    public isAllCarRun(time:number) {
        for(let _key in  this.carList) {
            let _car = this.carList[_key];
            if( _car.getStatus(time) == Status.Wait ) {
                return false;
            }
        }

        return true;
    }

    /**
     * 计算统计结果
     */
    public calcStatistics() {
        let data = {};
        for(let _index = 0; _index < this.carList.length; ++_index) {
            let _car = this.carList[_index];
            let _typeData = data[_car.agvType];
            if( _typeData == null ) {
                _typeData = {};
                _typeData['agvType'] = _car.agvType;
            }
            this._carStatistics(_typeData, _car);
            data[_car.agvType] = _typeData;
        }

        let dataArray = [];
        for(let _key in data) {
            dataArray.push(data[_key]);
        }

        sys.localStorage.setItem('plan_result:' + this.config.plan, JSON.stringify(dataArray));
    }

    /**
     * 真正的开始小车
     * @param time 
     */
    private _realHandle(time:number, type:TypeList) {
        this._insertDemand(time, type);
        let _car = this._selectCar(time, type);
        if( _car == null )
            return;

        this._fixMatter(time, _car, type);

        this._startCar(time, _car);
    }

    /**
     * 查找符合完美条件的
     * @param time 
     * @returns 
     */
    private _findMatterPerfect(time:number) {
        for(let _key in TypeList) {
            let _type = TypeList[_key];
            let _count = this.cache.getCountByType(time, _type);
            if( _count >= this.config.dragCount && this.getCarCountByType(time, Status.Wait, _type) > 0 && !this._hasTaskComplete(time, _type) ) {
                return _type;
            }
        }

        return null;
    }

    /**
     * 查找符合条件的物料
     * @param time 
     * @returns 
     */
    private _findMatterCheck(time:number) {
        for(let _key in TypeList) {
            let _type = TypeList[_key];
            let _leftCount = this.cache.getLeftCountByType(time, _type);
            if( _leftCount == 0 && this.getCarCountByType(time, Status.Wait, _type) > 0 && !this._hasTaskComplete(time, _type) ) {
                return _type;
            }
        }

        return null;
    }

    /**
     * 是否已经完成
     * @param time 
     * @param type 
     * @returns 
     */
    private _hasTaskComplete(time:number, type:string) {
        let _count = this._findDemandInTask(time, type);
        if( type == TypeList.Door ) {
            return _count >= this.config.doorCount;
        } else {
            return _count >= this.config.carpetCount;
        }
    }

    /**
     * 查找当前时间断内完成任务数量
     * @param time 
     * @param type 
     */
    private _findDemandInTask(time:number, type:string) {
        let _count = 0;
        for(let _key in this.demandTimeline) {
            let _type = this.demandTimeline[_key];
            if( _type != type ) {
                continue;
            }

            let _time = Number(_key);
            if( time > _time )
                break;

            if( this._calcTask(_time) == this._calcTask(time) ){
                ++_count;
            }
        }

        return _count;
    }

    /**
     * 插入需求完成
     * @param time 
     * @param type 
     */
    private _insertDemand(time:number, type:string) {
        this.demandTimeline[time] = type;
    }

    /**
     * 计算任务区间
     * @param time 
     * @returns 
     */
    private _calcTask(time:number) {
        return Math.floor(time / this.demand_space);
    }

    /**
     * 选择小车
     * @param time 
     * @param type 
     */
    private _selectCar(time:number, type:TypeList):Car {
        let _carList = this._selectCarByStatus(time, type, Status.Wait);
        _carList.sort((left, right) => {
            let _leftWait = left.getStatusCount(time, Status.Wait);
            let _rightWait = right.getStatusCount(time, Status.Wait)
            if( _leftWait!= _rightWait ) {
                return _leftWait - _rightWait;
            }

            let _leftAgvType = left.agvType;
            let _rightAgvType = right.agvType;
            if( _leftAgvType != _rightAgvType ) {
                return _leftAgvType.length - _rightAgvType.length;
            }

            return right.getLastWaitTime(time) - left.getLastWaitTime(time);
        });

        if( _carList.length == 0 ) {
            return null;
        }

        return _carList[0];
    }

    /**
     * 查询符合条件车的列表
     * @param time 
     * @param type 
     * @param status 
     */
    private _selectCarByStatus(time:number, type:TypeList, status:Status) {
        let _arr = new Array<Car>;
        for(let _key in  this.carList) {
            let _car = this.carList[_key];
            if( _car.getStatus(time) == status && _car.hasType(type) ) {
                _arr.push(_car);
            }
        }

        return _arr;
    }

    /**
     * 预定物料
     * @param time 
     * @param car 
     */
    private _fixMatter(time:number, car:Car, type:TypeList) {
        if( car.agvType == TypeList.Door || car.agvType == TypeList.Carpet ) {
            this._lockMatter(time, car, type);
        } else {
            this._multiFixMatter(time, car, type);
        }
    }

    /**
     * 多种的物料
     * @param time 
     * @param car 
     */
    private _multiFixMatter(time:number, car:Car, type:TypeList) {
        this._lockMatter(time, car, type);
        if( this.config.dragCount <= car.lockCount() ) {
            return;
        }

        // 其他的给补上
        for(let _key in TypeList) {
            let _type = TypeList[_key];
            if( type != _type ) {
                this._lockMatter(time, car, _type);
            }
        }
    }

    /**
     * 锁定物料
     * @param time 
     * @param car 
     * @param type 
     */
    private _lockMatter(time:number, car:Car, type:TypeList) {
        let _count = this.cache.getCountByType(time, type);
        let _fixCount = this.cache.getFixCountByType(time, type);
        let _lockCount = car.lockCount();

        let _needCount = Math.min(_count - _fixCount, this.config.dragCount - _lockCount);
        if( _needCount <= 0 ) {
            return;
        }

        this.cache.fixMatter(time, type, _needCount);
        car.lockMatter(time, type, _needCount);

        if ( _fixCount < 120 ) {
            // console.error('car start run: ', time, type, _count, _fixCount, _lockCount, _needCount, car.getLock());
        }
    }

    /**
     * 启动车
     * @param time 
     * @param car 
     */
    private _startCar(time:number, car:Car) {
        car.begin(time);

        director.emit('render_car_create', car.carId);

        this._runCar(time, car, this.route.getStartPoint(), this.route.getCachePoint());
    }

    /**
     * 让车开始跑
     * @param time 
     * @param car 
     * @param startPos 
     * @param endPost 
     */
    private _runCar(time:number, car:Car, startPosition:string, endPosition:string) {
        car.statusChange(time, Status.Run);
        car.run(startPosition, endPosition);
        car.runTime(this.route.calcRunTime(startPosition, endPosition, this.config.moveSpeed));

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            director.emit('render_car_run', car.carId, startPosition, endPosition, car._statusTime);
        }
    }

    /**
     * 每次处理汽车
     * @param time 
     */
    private _handleCar(time:number) {
        for(let _key in this.carList) {
            let _car = this.carList[_key];
            this._handleCarRun(time, _car);
            this._handleCarHook(time, _car);
            this._handleCarUnhook(time, _car);
        }
    }

    /**
     * 处理小车的跑
     * @param time 
     * @param car 
     */
    private _handleCarRun(time:number, car:Car) {
        if( car.getStatus(time) != Status.Run ) {
            return;
        }

        // 还在跑
        if( time < car.getLastStatusTime() + car.getRunTime() ) {
            return true;
        }

        // 开始状态
        if(car.getRunEndPoint() == this.route.getCachePoint()) {
            this._startHook(time, car);
            return;
        }

        // 是否结束了
        if(car.getRunEndPoint() == this.route.getStartPoint()) {
            // 小车回到终点
            // console.error('car run start pos: ', time, this.cache.getCount(time));
            car.statusChange(time, Status.Wait);

            if('1' == sys.localStorage.getItem('play_flag')) {
                director.emit('render_car_remove', car.carId);
            }

            return;
        }

        if( this.route.isExportPoint(car.getRunEndPoint()) ) {
            this._startUnHook(time, car);
        }
    }

    /**
     * 处理小车装载
     * @param time 
     * @param car 
     */
    private _handleCarHook(time:number, car:Car) {
        if( car.getStatus(time) != Status.Hook ) {
            return;
        }

        // 还在跑
        if( time < car.getLastStatusTime() + car._statusTime ) {
            return true;
        }

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            director.emit('render_car_matter_start', car.carId, car.getLockList());
        }
        this._runCar(time, car, car.getRunEndPoint(), this.route.getExportPoint());
    }

    /**
     * 处理小车卸载
     * @param time 
     * @param car 
     */
    private _handleCarUnhook(time:number, car:Car) {
        if( car.getStatus(time) != Status.Unhook ) {
            return;
        }

        // 还在跑
        if( time < car.getLastStatusTime() + car._statusTime ) {
            return true;
        }

        let _exit = this.route.findExit(car.getRunEndPoint());
        if( _exit != null ) {
            for(let _type in car.getLock()) {
                let _count = car.getLock()[_type];
                if( _count != null && _count > 0 )
                    _exit.appendMatter(_type, _count);
            }
        }

        if( '1' == sys.localStorage.getItem('play_flag') ) {
            director.emit('render_car_matter_stop', car.carId);
        }

        car.clearLock();

        this._runCar(time, car, car.getRunEndPoint(), this.route.getStartPoint());
    }

    /**
     * 开始装载
     * @param time 
     * @param car 
     */
    private _startHook(time:number, car:Car) {
        car.statusChange(time, Status.Hook);
        car._statusTime = this.config.hookTime;
        let _lockMatterMap = car.getLock();

        for(let _type in _lockMatterMap) {
            let _count = _lockMatterMap[_type];
            for(let _index = 0; _index < _count; ++_index) {
                this.cache.takeMatter(time, _type);
            }
        }
    }

    /**
     * 
     * @param time 
     * @param car 
     */
    private _startUnHook(time:number, car:Car) {
        car.statusChange(time, Status.Unhook);
        car._statusTime = this.config.unhookTime;
    }

    /**
     * 统计
     * @param data 
     * @param car 
     */
    private _carStatistics(typeData:{}, car:Car) {
        let _carData = {}
        _carData['countDeliveryTime'] = car.statisticsArray.length;

        for(let _index in car.statisticsArray) {
            let _statistics = car.statisticsArray[_index]; 
            for(let _key in  Status) {
                let _time = _statistics[Status[_key]];
                let _total = _carData[Status[_key]];
    
                if( _total == null ) {
                    _total = _time;
                } else {
                    _total = _total + _time;
                }
    
                _carData[Status[_key]] = _total;
            }

            let _transportTime = _statistics[Status.Run] + _statistics[Status.Hook] + _statistics[Status.Unhook];
            let _deliveryTime = Math.floor(_transportTime * this.config.deliverySpeed / 100) - _statistics[Status.Hook] - _statistics[Status.Unhook];

            if( typeData['minDeliveryTime'] == null ) {
                typeData['minDeliveryTime'] = _deliveryTime;
            } else {
                typeData['minDeliveryTime'] = Math.min(typeData['minDeliveryTime'], _deliveryTime);
            }

            if( typeData['maxDeliveryTime'] == null ) {
                typeData['maxDeliveryTime'] = _deliveryTime;
            } else {
                typeData['maxDeliveryTime'] = Math.max(typeData['maxDeliveryTime'], _deliveryTime);
            }

            if( typeData['totalDeliveryTime'] == null ) {
                typeData['totalDeliveryTime'] = _deliveryTime;
            } else {
                typeData['totalDeliveryTime'] = typeData['totalDeliveryTime'] +  _deliveryTime;
            }
        } 

        if( typeData['countDeliveryTime'] == null ) {
            typeData['countDeliveryTime'] = car.statisticsArray.length;
        } else {
            typeData['countDeliveryTime'] = typeData['countDeliveryTime'] + car.statisticsArray.length;
        }

        let _carDataArray = typeData['carData'];
        if(_carDataArray == null) {
            _carDataArray = [];
        }

        _carDataArray.push(_carData);
        typeData['carData'] = _carDataArray;

        if( null == typeData['count'] ) {
            typeData['count'] = 1;
        } else {
            typeData['count'] = typeData['count'] + 1;
        }

        // console.error('card data: ', typeData, car.statisticsArray);
    }

    /**
     * 清理小车
     */
    public clearCar() {
        for(let _key in  this.carList) {
            let _car = this.carList[_key];
            director.emit('render_car_remove', _car.carId);
        }
    }
}

