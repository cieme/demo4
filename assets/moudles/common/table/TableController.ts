import { _decorator, Component, Node } from 'cc';
import { RowController } from './RowController';
const { ccclass, property } = _decorator;

@ccclass('TableController')
export class TableController extends Component {

    /**
     * 行列表
     */
    private rowList:Array<RowController>;

    onLoad() {
        this.rowList = this.getComponentsInChildren(RowController);
    }

    public refreshBegin(){
        for(let _index in this.rowList) {
            let rowController = this.rowList[_index];
            rowController.node.active = false;
        }
    }

    public refreshRow(row:number, data:Array<string>) {
        if( row < 0 || row >= this.rowList.length )
            return;

        let rowController = this.rowList[row];
        rowController.refresh(data);
        rowController.node.active = true;
    }
}

