import { _decorator, Color, Component, Label, Node } from 'cc';
import { TableController } from '../../common/table/TableController';
import { PieController } from '../../common/pie/PieController';
const { ccclass, property } = _decorator;

@ccclass('ResultController')
export class ResultController extends Component {

    @property({type: Label})
    public title:Label;

    @property({type: TableController})
    public statistics: TableController;

    @property({type:[PieController]})
    public carPie : PieController[] = []

    /**
     * 刷新数据
     * @param data 
     */
    public refresh(data:{}) {
        this._refreshStatistics(data);
        this._refreshCar(data);
    }

    /**
     * 刷新统计数据
     * @param data 
     */
    private _refreshStatistics(data:{}) {
        // console.error('_refreshStatistics: ', data);
        this.statistics.refreshBegin();
        this.statistics.refreshRow(0, [data['count'], data['minDeliveryTime']]);
        this.statistics.refreshRow(1, [Math.floor(Number(data['totalDeliveryTime']) / Number(data['countDeliveryTime'])).toString(), data['maxDeliveryTime']]);
        let _carDataArray = data['carData'];
        if( _carDataArray.length > 0 )
            this.statistics.refreshRow(2, ['AGV1完成次数', _carDataArray[0].countDeliveryTime, '', '']);
    }

    private _refreshCar(data:{}) {
        let _colorArray = [new Color(21, 192, 102), new Color(0, 118, 246), new Color(45, 178, 255), new Color(242, 189, 66)];
        let _carDataArray = data['carData'];

        for(let _index = 0; _index < _carDataArray.length && _index < this.carPie.length; ++_index) {
            let _carData = _carDataArray[_index];
            let _pie = this.carPie[_index];

            let _pieData = [Number(_carData['run']) + Number(_carData['hook']) + Number(_carData['unhook']), _carData['wait'], _carData['hook'], _carData['unhook']];

            _pie.refresh(_pieData, _colorArray);
        }
    }
}

