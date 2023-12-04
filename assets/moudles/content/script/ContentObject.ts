import { _decorator, Component, Label, resources, Sprite, SpriteFrame, Texture2D, Node, director, Prefab, instantiate } from 'cc';
import { RenderObject } from '../../common/script/RenderObject';
import { MatterController } from '../../render/script/MatterController';
const { ccclass, property } = _decorator;

@ccclass('ContentObject')
export class ContentObject extends Component {

    public objectType: string;
    public objectShowName: string;
    public objectPicture: string;

    @property({type: Sprite})
    public pictureSprite: Sprite;

    @property({type: Label})
    public showName: Label;

    @property({type: Node})
    public backNode: Node;

    @property({type: Node})
    public matterNode: Node;

    @property({type: Prefab})
    public matterPrefab: Prefab;

    /**
     * 点击事件
     */
    public clickFuncion: Function;

    onLoad() {
        resources.load(this.objectPicture, SpriteFrame, (err, spriteFrame: SpriteFrame) => {
            this.pictureSprite.spriteFrame = spriteFrame;
        });

        this.showName.string = this.objectShowName;
    }

    /**
     * 点击事件
     */
    onClick() {
        console.error('content object click 0');
        if(this.clickFuncion) {
            console.error('content object click 1');
            this.clickFuncion();
        }
    }

    public onPlanPlay(uniqueId:string) {
        if( this.matterNode == null ) {
            return;
        }

        let _matterCount = instantiate(this.matterPrefab);

        _matterCount.parent = this.matterNode;
        let _matterController = _matterCount.getComponent(MatterController);
        _matterController.uniqueId = uniqueId;
    }
}

