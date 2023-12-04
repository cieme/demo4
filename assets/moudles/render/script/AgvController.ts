import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { CarController } from './CarController';
const { ccclass, property } = _decorator;

@ccclass('AgvController')
export class AgvController extends Component {

    @property({type: Prefab})
    public carPrefab: Prefab;

    onLoad() {
        director.on('plan_play_start', this._playStart, this);
        director.on('plan_play_refresh', this._playRefresh, this);
        director.on('plan_play_pause', this._playPause, this);

        director.on('render_car_create', this._carCreate, this);
    }

    onDestroy() {
        director.off('plan_play_start', this._playStart, this);
        director.off('plan_play_refresh', this._playRefresh, this);
        director.off('plan_play_pause', this._playPause, this);

        director.off('render_car_create', this._carCreate, this);
    }

    update(dt: number): void {
        
    }

    /**
     * 开始播放
     */
    _playStart() {
        // let carNode = instantiate(this.carPrefab);

        // this.node.addChild(carNode);
    }

    _carCreate(carId:string) {
        let carNode = instantiate(this.carPrefab);
        let _carController = carNode.getComponent(CarController);
        _carController.carId = carId;

        this.node.addChild(carNode);
    }

    /**
     * 刷新
     */
    _playRefresh() {

    }

    /**
     * 播放暂停
     */
    _playPause() {

    }

}

