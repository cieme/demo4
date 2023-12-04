import { _decorator, Component, Graphics, Node, UITransform, v2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GridController')
export class GridController extends Component {
    private graphics: Graphics;

    start() {
        this.graphics = this.getComponent(Graphics);
        if( this.graphics == null )
            return;

        this.buildGrid();
    }

    update(deltaTime: number) {
        
    }

    buildGrid() {
        let pos = this.node.position;
        let uiTrans = this.getComponent(UITransform);
        let size = uiTrans.contentSize;
        let anchor = uiTrans.anchorPoint;

        let startPos = v2(pos.x - anchor.x * size.width, pos.y - anchor.y * size.height);
        let endPos = v2(pos.x + anchor.x * size.width, pos.y + anchor.y * size.height);
        this.buildRowLine(startPos, endPos);
        this.buildColLine(startPos, endPos);

        this.graphics.stroke();
    }

    buildRowLine(startPos, endPos) {
        let startX = startPos.x;
        let endX = endPos.x;
        for(let posY = startPos.y; posY <= endPos.y; posY = posY + 10) {
            this.graphics.moveTo(startX, posY);
            this.graphics.lineTo(endX, posY);
        }
    }

    buildColLine(startPos, endPos) {
        let startY = startPos.y;
        let endY = endPos.y;
        for(let posX = startPos.x; posX <= endPos.x; posX = posX + 10) {
            this.graphics.moveTo(posX, startY);
            this.graphics.lineTo(posX, endY);
        }
    }
}

