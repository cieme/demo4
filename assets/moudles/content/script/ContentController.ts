import { _decorator, Component, Prefab, Node, instantiate, director } from 'cc';
import { ContentObject } from './ContentObject';
const { ccclass, property } = _decorator;

@ccclass('ContentController')
export class ContentController extends Component {

    @property({type: Node})
    public btnShow: Node;

    @property({type: Node})
    public btnHide: Node;

    @property({type: Node})
    public layoutContent: Node;

    @property({type: Prefab})
    public objectPrefab: Prefab;

    @property({type: Node})
    public baseNode: Node;

    @property({type: Node})
    public logisticNode: Node;

    @property({type: Node})
    public transferNode: Node;

    @property({type: Node})
    public trackNode: Node;

    @property({ type: Node, tooltip: "矢量素材" })
    public vectorNode: Node;

    start() {
        this.buildBaseObject("entry", "入口");
        this.buildBaseObject("staging", "暂存区");
        this.buildBaseObject("exit", "出口");
        this.buildBaseObject("treatment", "加工站");
        this.buildBaseObject("synthesizer", "合成器");
        this.buildBaseObject("resolver", "分解器");
        this.buildBaseObject("process", "处理器");
        this.buildBaseObject("store", "仓库");

        this.buildLogisticObject("agv", "AGV系统");

        this.buildTransferObject("transfer", "传送线");
        this.buildTransferObject("lane", "车道");

        this.buildTrackObject("path", "AGV路径");
        this.buildTrackObject("control", "控制点");

        const vectorArr = [
            { value: "text", label: "文本" },
            { value: "rect", label: "矩形" },
            { value: "polygon", label: "多边形" },
            { value: "circle", label: "圆形" },
          ];
        vectorArr.forEach((item) => {
            this.buildVectorObject(item.value, item.label);
        });

    }

    update(deltaTime: number) {

    }

    updateShow(visible:boolean) {
        this.btnHide.active = visible;
        this.btnShow.active = !visible;
        this.layoutContent.active = visible;
    }

    onClickHide() {
        this.updateShow(false);
    }

    onClickShow() {
        this.updateShow(true);
    }

    /**
     * 构建对象
     * @param objectName
     * @param objectShowName
     */
    buildObject(objectType:string, objectShowName:string) {
        let node = instantiate(this.objectPrefab);
        let content =  node.getComponent(ContentObject);
        content.objectType = objectType;
        content.objectPicture = "content/picture/content_object_" + objectType + "/spriteFrame";
        content.objectShowName = objectShowName;
        content.clickFuncion = () => {
            this._onClick(objectType, objectShowName);
            director.emit('render_object_select', node);
        }

        return node;
    }

    buildBaseObject(objectType:string, objectShowName:string) {
        let node = this.buildObject(objectType, objectShowName);
        this.baseNode.addChild(node);
    }

    buildLogisticObject(objectType:string, objectShowName:string) {
        let node = this.buildObject(objectType, objectShowName);
        this.logisticNode.addChild(node);
    }

    buildTransferObject(objectType:string, objectShowName:string) {
        let node = this.buildObject(objectType, objectShowName);
        this.transferNode.addChild(node);
    }

    buildTrackObject(objectType:string, objectShowName:string) {
        let node = this.buildObject(objectType, objectShowName);
        this.trackNode.addChild(node);
    }

    /**
     * 创建矢量对象
     * @param {string} objectType:resource name
     * @param {string} objectShowName:label text
     * @returns {void}
     */
    buildVectorObject(objectType: string, objectShowName: string) {
        let node = this.buildObject(objectType, objectShowName);
        this.vectorNode.addChild(node);
    }


    _onClick(objectType:string, objectShowName:string) {
        console.error('content: ', objectType, objectShowName);
        director.emit('content_list_click', objectType, objectShowName);
    }
}

