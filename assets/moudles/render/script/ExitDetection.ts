import { _decorator, Component, Label, Node, Sprite, sys, UITransform, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ExitDetection')
export class ExitDetection extends Component {
    @property({type: Label})
    public count:Label;

    @property({type: Label})
    public use:Label;

    @property({type: Label})
    public unUse:Label;

    @property({type: Sprite})
    public sprite:Sprite;

    public refresh(index:string) {
        let _count = sys.localStorage.getItem('render_play_exit_' + index);
        if( _count == null ) {
            _count = '0'
        }

        this.count.string = _count;
        let _value = Number(_count);
        this.sprite.fillRange = _value / 100;

        let _uiTransform = this.sprite.getComponent(UITransform);
        let _useValue = Math.floor(_value / 100 * 100);
        let unUseValue = 100 - _useValue;

        this.use.string = _useValue + "%";
        this.use.node.position = v3(this.sprite.node.position.x + _uiTransform.width * _useValue / 100 / 2 - _uiTransform.width / 2, 0, 0); 
        this.use.node.active = _useValue > 0;

        this.unUse.string = unUseValue + "%";
        this.unUse.node.active = unUseValue > 0;
        this.unUse.node.position = v3(this.use.node.position.x + _uiTransform.width / 2, 0, 0); 

    }
}

