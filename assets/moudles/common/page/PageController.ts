import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PageController')
export class PageController extends Component {

    /**
     * 当前页
     */
    @property({type : Label})
    public curPage : Label;

    @property({type : Label})
    public totalPage : Label;

    /**
     * 每页数量
     */
    public size : number;

    /**
     * 总数量
     */
    public total : number;

    /**
     * 当前页
     */
    private _current : number;

    /**
     * 总页数
     */
    private _totalPage : number;


    private _refreshEvent : Function;

    /**
     * 点击上一页
     */
    public onPrePage() {
        let modifyCurren = Math.max(this._current - 1, 1);
        if( this._current == modifyCurren ) {
            return ;
        }

        this._current = this._current - 1;
        this._refreshCurrentPage();
        if( this._refreshEvent ) {
            this._refreshEvent( this._current );
        }
    }

    /**
     * 点击下一页
     */
    public onNextPage() {
        let modifyCurren = Math.min(this._current + 1, this._totalPage);
        if( this._current == modifyCurren ) {
            return ;
        }

        this._current = this._current + 1;
        this._refreshCurrentPage();
        if( this._refreshEvent ) {
            this._refreshEvent( this._current );
        }
    }

    /**
     * 刷新
     * @param total 
     * @param size 
     */
    public refresh(total : number, size : number, refreshFunction : Function) {
        this.total = total;
        this.size = size;
        this._refreshEvent = refreshFunction;

        this._calcPage();
        this._refreshCurrentPage();
        if( this._refreshEvent ) {
            this._refreshEvent( this._current );
        }
    }

    private _calcPage() {
        if( this.size != null ) {
            this._totalPage = Math.floor((this.total + this.size - 1) / this.size);
            this._current = Math.min(1, this._totalPage);
        } else {
            this._totalPage = 0;
            this._current = 0;
        }

        this.totalPage.string = this._totalPage.toString();
    }

    private _refreshCurrentPage() {
        this.curPage.string = this._current.toString();
    }
}

