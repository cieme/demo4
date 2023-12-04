import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RowController')
export class RowController extends Component {
    /**
     * 列表
     */
    @property({type:[Label]})
    public colList: Label[] = [];

    public refresh(dataArray:Array<string>) {
        if( dataArray == null )
            return;
        for(let _index = 0; _index < this.colList.length && _index < dataArray.length; ++_index) {
            let _label = this.colList[_index];
            _label.string = dataArray[_index];
        }
    }
}

