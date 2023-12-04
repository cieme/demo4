import { _decorator, Color, Component, instantiate, Node, Prefab, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PieController')
export class PieController extends Component {
    @property({type:Prefab})
    public defaultSprite:Prefab;

    private _pieArray = new Array<Sprite>;

    onLoad() {
        let _dataArray = new Array<number>(30, 30, 20, 100);
        let _colorArray = new Array<Color>(new Color(45, 178, 255), new Color(242, 189, 66), new Color(21, 192, 102), new Color(0, 118, 246));

        this.refresh(_dataArray, _colorArray);
    }

    /**
     * 刷新数据
     * @param dataArray 
     * @param colorArray 
     */
    public refresh(dataArray:Array<number>, colorArray:Array<Color>) {
        this.removeAllPie();
        let _total = 0;
        dataArray.forEach((data:number) => { _total = _total + data});
        if( _total <= 0 ) {
            _total = 100;
        }

        let _start = 0;
        for(let _key in dataArray) {
            let _value = dataArray[_key];
            let _node = instantiate(this.defaultSprite);
            let _sprite = _node.getComponent(Sprite);
            _sprite.color = colorArray[_key];

            _sprite.fillStart = _start;
            let _range = _value / _total;
            _sprite.fillRange = _range;

            _start += _range;

            this._pieArray.push(_sprite);

            this.node.addChild(_node);
        }
    }

    private removeAllPie() {
        for(let _index in  this._pieArray) {
            let _pie = this._pieArray[_index];
            _pie.node.removeFromParent();
        }

        this._pieArray = new Array<Sprite>;
    }
}

