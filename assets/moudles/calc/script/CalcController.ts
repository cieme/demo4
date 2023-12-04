import { _decorator, Color, Component, director, game, Game, sys } from 'cc';
import { Entry } from './Entry';
import { Route } from './Route';
import { Agv } from './Agv';
import { Config } from './Config';
import { MatterAlloc } from './MatterAlloc';
import { TypeList } from './Matter';
import { Cache } from './Cache';
import { ContentObject } from '../../content/script/ContentObject';
import { RenderObject } from '../../common/script/RenderObject';
import { Exit } from './Exit';
const { ccclass, property } = _decorator;

@ccclass('CalcController')
export class CalcController extends Component {

    private entry:Entry;

    private cache:Cache;

    private route:Route;

    private agv:Agv;

    private config:Config;

    private exitList:Exit[] = new Array<Exit>;

    private playFlag: boolean = false;

    private playTime: number = 0;

    private speed : number = 1;

    onLoad() {
        // this.calc('plan0');
        director.on('render_calc', this.calc, this);
        director.on('plan_play_start', this.play, this);

        director.on('render_speed_change', this._speedChange, this);

        director.on('plan_play_refresh', this._refreshPlay, this);
        director.on('plan_play_stop', this._stopPlay, this);
    }

    onDestroy() {
        director.off('render_calc', this.calc, this);
        director.off('plan_play_start', this.play, this);
        director.off('render_speed_change', this._speedChange, this);

        director.off('plan_play_refresh', this._refreshPlay, this);
        director.on('plan_play_stop', this._stopPlay, this);
    }

    _speedChange(speed) {
        this.speed = speed;
    }

    /**
     * 播放
     */
    public play() {
        if( this.playFlag )
            return;

        game.frameRate = 30;

        console.error('start play: ');

        let plan = sys.localStorage.getItem('plan_select');
        this.playFlag = true;
        this.playTime = 0;

        this._clearDetection();

        this._build();
        this._initConfig(plan);
        this._initComponent(plan);

        sys.localStorage.setItem('play_flag', '1');
    }

    /**
     * 刷新播放
     */
    private _refreshPlay() {
        this._stopPlay();

        this.play();
    }

    /**
     * 刷新播放
     */
    private _stopPlay() {
        this.playFlag = false;
        sys.localStorage.removeItem('play_flag');

        this.agv.clearCar();
    }

    update(dt: number): void {
        if( this.playFlag == false)
            return;

        for(let _index = 0; _index < this.speed; ++_index) {
            this._timeHandle(this.playTime);
            this.playTime = this.playTime + 1;
        }
    }

    /**
     * 计算
     * @param plan 
     */
    public calc(plan:string) {
        if(this.playFlag) {
            return;
        }

        this._build();
        this._initConfig(plan);
        this._initComponent(plan);
        this._handle();
        this.agv.calcStatistics();
    }

    /**
     * 构建对象
     */
    private _build(){
        this.entry = new Entry;
        this.cache = new Cache;
        this.route = new Route;
        this.agv = new Agv;
        this.config = new Config;
    }

    /**
     * 初始化
     * @param plan 
     */
    private _initConfig(plan:string) {
        this.config.plan = plan;
        let param = JSON.parse(sys.localStorage.getItem('plan_param:' + plan));
        this.config.agvType = param['agvType'];
        this.config.span = param['span'];
        this.config.doorCount = param['doorCount'];
        this.config.carpetCount = param['carpetCount'];

        this.config.moveSpeed = Number(param['moveSpeed'])
        this.config.hookTime = Number(param['hookTime']);
        this.config.unhookTime = Number(param['unhookTime']);
        this.config.deliverySpeed = Number(param['deliverySpeed']);
        this.config.dragCount = Number(param['dragCount']);

        let entryParam = JSON.parse(sys.localStorage.getItem('plan_entry_param:' + plan));
        if( entryParam != null ) {
            this.config.spanSpace = Number(entryParam['spanSpace']);
            this.config.spanTotal = Number(entryParam['spanTotal']);
        } else {
            this.config.spanSpace = 10;
            this.config.spanTotal = 100;
        }
    }

    /**
     * 初始化组件
     */
    private _initComponent(plan:string) {
        this._initEntry();
        this.cache.setEntry(this.entry);
        this.agv.init(this.cache, this.config, this.route);
        this._initRoute(plan);
    }

    /**
     * 初始化进入
     */
    private _initEntry() {
        let _matterRatio = new Array<MatterAlloc>;
        let _alloc = new MatterAlloc;
        _alloc.color = Color.RED;
        _alloc.name = '车门';
        _alloc.type = TypeList.Door;
        _alloc.ratio = 0.3;

        _matterRatio.push(_alloc);

        let _alloc1 = new MatterAlloc;
        _alloc1.color = Color.GREEN;
        _alloc1.name = '地毯';
        _alloc1.type = TypeList.Carpet;
        _alloc1.ratio = 0.7;
        _matterRatio.push(_alloc1);

        this.entry.init(this.config.spanSpace, this.config.spanTotal, _matterRatio);
    }

    /**
     * 初始化路径
     * @param plan 
     */
    private _initRoute(plan:string) {
        this.config.pointMap = JSON.parse(sys.localStorage.getItem('plan_point:' + plan));
        this.config.cachePosIndex = "";
        this.config.startPosIndex = "";
        this.config.exportPosIndex = [];
        this.exitList = new Array<Exit>;

        let itemArray = this.getComponentsInChildren(ContentObject);
        for(let _index in itemArray) {
            let _item = itemArray[_index];
            let _content = _item.getComponent(RenderObject);

            if( _item.objectType == 'staging' ) {
                if(_content.rightId != null) {
                    let _stringId = _content.rightId;
                    this.config.cachePosIndex = _stringId;
                    this.cache.uniqueId = _content.uniqueId;
                    if( this.playFlag )
                        _item.onPlanPlay(_content.uniqueId);
                }
            }

            if( _item.objectType == 'exit' ) {
                if(_content.rightId != null) {
                    let _stringId = _content.rightId;
                    this.config.exportPosIndex.push(_stringId);

                    let _exit = new Exit;
                    _exit.uniqueId = _content.uniqueId;
                    _exit.rightId = _content.rightId;
                    _exit.index = this.exitList.length;

                    this.exitList.push(_exit);
                    if( this.playFlag )
                        _item.onPlanPlay(_content.uniqueId);
                }
            }

            if( _item.objectType == 'agv' ) {
                if(_content.rightId != null) {
                    let _stringId = _content.rightId;
                    this.config.startPosIndex = _stringId;
                }
            }
        }

        this.route.init(this.config, this.exitList);
    }

    /**
     * 处理
     */
    private _handle() {
        let run = true;
        let time = 0;
        while(run) {
            this._timeHandle(time);

            // 判断是否可以退出
            if( 0 == this.cache.getLeftCount(time) && 0 == this.cache.getCount(time) && this.agv.isAllCarWait(time) ) {
                run = false;
                console.error('exit time: ', time);
                break;
            }

            if( time % 100 == 0 )
                console.error('heart time: ', time);

            if( time > 10000 ) {
                run = false;
            }

            ++time;
        }
    }

    private _timeHandle(time:number) {
        // console.error('time play: ', time);
        this.entry.handle(time);
        this.cache.handle(time);
        this.agv.handle(time);

        // 判断是否可以退出
        if( 0 == this.cache.getLeftCount(time) && 0 == this.cache.getCount(time) && this.agv.isAllCarWait(time) ) {
            this.playFlag = false;
            sys.localStorage.removeItem('play_flag');
            director.emit('render_play_end');
        }
    }

    /**
     * 清空实时模拟的缓存
     */
    private _clearDetection() {
        for(let _index in  TypeList) {
            sys.localStorage.removeItem('render_play_entry_' + _index);
        }

        sys.localStorage.removeItem('render_play_staging');
        for(let _index = 0; _index < 100; ++_index) {
            sys.localStorage.removeItem('render_play_exit_' + _index);
            sys.localStorage.removeItem('render_play_car_' + _index);
        }
    }
}

