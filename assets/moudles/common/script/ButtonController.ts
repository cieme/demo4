import { _decorator, Component, EventHandler, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;


export enum ButtonStatus {
    Normal = 'normal', 

    Press = 'press', 

    Disable = 'disable'
}

@ccclass('ButtonController')
export class ButtonController extends Component {
    @property({type: SpriteFrame})
    public normalSprite:SpriteFrame;

    @property({type: SpriteFrame})
    public pressSprite:SpriteFrame;

    @property({type: SpriteFrame})
    public disableSprite:SpriteFrame;

    private sprite:Sprite;

    protected onLoad(): void {
        this.sprite = this.getComponent(Sprite);
    }

    public changeStatus(status:ButtonStatus) {
        if( this.sprite == null )
            return;

        if( status == ButtonStatus.Disable ) {
            this.sprite.spriteFrame = this.disableSprite;
        } else if( status == ButtonStatus.Press ) {
            this.sprite.spriteFrame = this.pressSprite;
        } else {
            this.sprite.spriteFrame = this.normalSprite;
        }
    }
}

