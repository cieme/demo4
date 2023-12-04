import { _decorator, Color, Component, director, Label, Node, Sprite, sys, UITransform, v3 } from 'cc';
import { PieController } from '../../common/pie/PieController';
import { TypeList } from '../../calc/script/Matter';
import { ExitDetection } from './ExitDetection';
const { ccclass, property } = _decorator;

@ccclass('DetectionController')
export class DetectionController extends Component {
    @property({type: Label})
    public entryCreateTotal:Label;

    @property({type: PieController})
    public entryPie:PieController;

    @property({type: Label})
    public stagingCount:Label;

    @property({type: Label})
    public stagingUse:Label;

    @property({type: Label})
    public stagingUnUse:Label;

    @property({type: Sprite})
    public stagingSprite:Sprite;

    @property({type: [ExitDetection]})
    public exitArray:Array<ExitDetection> = new Array<ExitDetection>;

    @property({type: [PieController]})
    public carArray:Array<PieController> = new Array<PieController>;

    onClose() {
        this.node.active = false;
    }

    protected onEnable(): void {
        director.on('render_play_detection_refresh', this._onRefresh, this);

        this._onRefresh();
    }

    protected onDisable(): void {
        director.off('render_play_detection_refresh', this._onRefresh, this);
    }

    /**
     * 刷新一下
     */
    _onRefresh() {
        this._onRefreshEntry();
        this._onRefreshStaging();
        this._onRefreshExit();
        this._onRefreshCar();
    }

    _onRefreshEntry() {
        let _total = 0;
        let _arrayCount = [];
        for(let _index in TypeList) {
            let _type = TypeList[_index];
            let _value = sys.localStorage.getItem('render_play_entry_' + _type);
            if( _value == null ) {
                _arrayCount.push(0);
            } else {
                _arrayCount.push(Number(_value));
                _total = _total + Number(_value);
            }
        }
        this.entryCreateTotal.string = _total.toString();

        let _arrayColor = [new Color(7, 252, 26), new Color(240, 145, 54)];
        this.entryPie.refresh(_arrayCount, _arrayColor);
    }

    private _onRefreshStaging() {
        let _count = sys.localStorage.getItem('render_play_staging');
        if( _count == null ) {
            _count = '0'
        }

        this.stagingCount.string = _count;
        let _value = Number(_count);
        this.stagingSprite.fillRange = _value / 100;

        let _uiTransform = this.stagingSprite.getComponent(UITransform);
        let _useValue = Math.floor(_value / 100 * 100);
        let unUseValue = 100 - _useValue;

        this.stagingUse.string = _useValue + "%";
        this.stagingUse.node.position = v3(this.stagingSprite.node.position.x + _uiTransform.width * _useValue / 100 / 2, 0, 0); 
        this.stagingUse.node.active = _useValue > 0;

        this.stagingUnUse.string = unUseValue + "%";
        this.stagingUnUse.node.active = unUseValue > 0;
        this.stagingUnUse.node.position = v3(this.stagingSprite.node.position.x + _uiTransform.width * _useValue / 100 / 2 + _uiTransform.width / 2, 0, 0); 
    }

    private _onRefreshExit() {
        for(let _index in this.exitArray) {
            let _exitDetection = this.exitArray[_index];
            _exitDetection.refresh(_index);
        }
    }

    private _onRefreshCar() {
        let _carCount = sys.localStorage.getItem('render_play_car_count');
        let _count = 0;
        if( _carCount == null ) {
            _count = 0;
        } else {
            _count = Number(_carCount);
        }

        for(let _index in this.carArray) {
            let _car = this.carArray[_index];
            _car.node.parent.parent.active = Number(_index) < _count;
            if( Number(_index) < _count ) {
                this._onRefreshCarSingle(Number(_index));
            }
        }
    }

    private _onRefreshCarSingle(index:number) {
        let _car = this.carArray[index];
        let _colorArray = [new Color(21, 192, 102), new Color(0, 118, 246), new Color(45, 178, 255), new Color(242, 189, 66)];

        let _carData = JSON.parse(sys.localStorage.getItem('render_play_car_' + index));

        let _pieData = [this._getCarNumber(_carData, 'run') + this._getCarNumber(_carData, 'hook') + this._getCarNumber(_carData, 'unhook')
        , this._getCarNumber(_carData, 'wait'), 
        this._getCarNumber(_carData, 'hook'), 
        this._getCarNumber(_carData, 'unhook')];

        _car.refresh(_pieData, _colorArray);
    }

    private _getCarNumber(carData:{}, status:string) {
        if( carData == null ) {
            return 0;
        }
        
        let _value = carData[status];
        return _value == null ? 0 : Number(_value);
    }
}

