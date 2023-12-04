import { _decorator, Component, director, Node, sys, v2, v3, Vec2 } from 'cc';
import { DirectionController } from '../../common/script/DirectionController';
import { MatterController } from './MatterController';
const { ccclass, property } = _decorator;

@ccclass('CarController')
export class CarController extends Component {
    @property({type: Node})
    public carSprite: Node;

    @property({type: MatterController})
    public matterCount: MatterController;

    /**
     * 路径列表
     */
    private positionMap;

    private curPath: string = "";

    private _speed: number = 40;

    private _multiple: number = 1;

    private _moveTime = 0;

    private _totalTime = 0;

    private _startPos: Vec2;

    private _endPos: Vec2;

    private _distance: number;

    public carId:string;

    private endPosition: string = "";

    private _direction:DirectionController;

    start() {
        this._multiple = 1;
    }

    update(deltaTime: number) {
        // this._moveTime = this._moveTime + deltaTime * this._multiple;
        this._moveTime = this._moveTime + 1 * this._multiple;
        this._calcPosition();
    }

    onLoad() {
        this._direction = this.getComponent(DirectionController);
        director.on('render_speed_change', this._speedChange, this);
        director.on('render_car_run', this._carRun, this);
        director.on('render_car_remove', this._carRemove, this);

        director.on('render_car_matter_start', this._onPlanPlay, this);
        director.on('render_car_matter_stop', this._onPlanStop, this);

        let plan = sys.localStorage.getItem('plan_select');
        this.positionMap = JSON.parse(sys.localStorage.getItem('plan_point:' + plan));

        this.curPath = "";
        this.node.position = v3(-10000, -10000, 0);

        let param = JSON.parse(sys.localStorage.getItem('plan_param:' + plan));
        this._speed = Number(param['moveSpeed']);

        // this._calcPath();
    }

    onDestroy() {
        director.off('render_speed_change', this._speedChange, this);
        director.off('render_car_run', this._carRun, this);
        director.off('render_car_remove', this._carRemove, this);
        director.off('render_car_matter_start', this._onPlanPlay, this);
        director.off('render_car_matter_stop', this._onPlanStop, this);
    }

    _speedChange(multiple: number) {
        // console.error('speed change: ', multiple);
        this._multiple = multiple;
        if( this.positionMap[this.curPath].rightId == this.endPosition ) {
            return;
        }

        this._startPos = this.positionMap[this.curPath];
        this._endPos = this.positionMap[this.positionMap[this.curPath].rightId];
        this._distance = Vec2.distance(this._startPos, this._endPos);
        this._totalTime = this._distance / this._speed / this._multiple;
        let curDistance = Vec2.distance(this._startPos, v2(this.node.position.x, this.node.position.y));

        this._moveTime = this._totalTime * curDistance / this._distance;
    }

    _calcPath() {
        if( this.curPath == this.endPosition ) {
            this._moveEnd();
            return;
        }

        this._startPos = this.positionMap[this.curPath];
        this._endPos = this.positionMap[this.positionMap[this.curPath].rightId];

        this._distance = Vec2.distance(this._startPos, this._endPos);

        this._totalTime = this._distance / this._speed / this._multiple;
        this._moveTime = 0;

        this._direction.startPos = v3(this._startPos.x, this._startPos.y, 0);
        this._direction.endPos = v3(this._endPos.x, this._endPos.y, 0);
        this._direction.updateDirection();
    }

    _calcPosition() {
        if( this.curPath == this.endPosition ){
            this._moveEnd();
            return;
        }

        if(this._startPos == null || this._endPos == null) {
            return ;
        }

        let ratio = this._moveTime / this._totalTime;
        let posX = ratio * (this._endPos.x - this._startPos.x) + this._startPos.x;
        let posY = ratio * (this._endPos.y - this._startPos.y) + this._startPos.y;

        this.node.position = v3(posX, posY, 0);

        if(ratio >= 1) {
            this.curPath = this.positionMap[this.curPath].rightId;
            this._totalTime = 0;
            this._calcPath();
        }
    }

    _moveEnd() {
        // this.node.removeFromParent();
    }

    /**
     * 小车移动
     * @param carId 
     * @param startPosition 
     * @param endPosition 
     * @returns 
     */
    _carRun(carId:string, startPosition:string, endPosition:string) {
        // console.error('ctrl car run', carId, this.carId);
        if( carId != this.carId ) {
            return;
        }

        // console.error('ctrl car run: ', startPosition, endPosition);

        this.curPath = startPosition;
        this.endPosition = endPosition;

        this._calcPath();
    }

    _carRemove(carId:string) {
        if( carId != this.carId ) {
            return;
        }

        this.node.removeFromParent();
    }

    public _onPlanPlay(carId:string, listNumber:number[]) {
        if( carId != this.carId ) {
            return;
        }

        this.matterCount.uniqueId = carId;
        this.matterCount.node.active = true;
        this.schedule(()=>{
            this.matterCount.refreshMatter(this.carId, listNumber);
        });
    }

    public _onPlanStop(carId:string) {
        if( carId != this.carId ) {
            return;
        }

        this.matterCount.node.active = false;
    }
}

